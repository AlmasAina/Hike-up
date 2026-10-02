import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthUser } from '@hikeup/types';
import { AuditService } from '../audit/audit.service';
import type { RequestMeta } from '../common/decorators/request-meta.decorator';
import { generateToken, sha256 } from '../common/utils/crypto';
import { AppConfig } from '../config/app-config';
import { button, emailLayout, paragraph } from '../mail/mail-templates';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { authUserSelect, toAuthUser } from '../users/user.mapper';
import type { ChangePasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';
import { PasswordService } from './password.service';
import { TokenService, type IssuedTokens } from './token.service';

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const VERIFY_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

@Injectable()
export class AuthService {
  private readonly logger = new Logger('Auth');
  private dummyHash?: Promise<string>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
    private readonly mail: MailService,
    private readonly settings: SettingsService,
    private readonly audit: AuditService,
    private readonly config: AppConfig,
  ) {}

  async register(dto: RegisterDto, meta: RequestMeta): Promise<{ user: AuthUser; tokens: IssuedTokens }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('An account with this email already exists');

    const role = await this.prisma.role.findUniqueOrThrow({ where: { name: 'CUSTOMER' } });
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: await this.passwords.hash(dto.password),
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        whatsapp: dto.whatsapp ?? null,
        roles: { create: { roleId: role.id } },
      },
      select: authUserSelect,
    });

    // Link earlier guest requests submitted with the same email address.
    await this.prisma.quoteRequest.updateMany({
      where: { email: dto.email, customerId: null },
      data: { customerId: user.id },
    });

    await this.audit.log({ actorId: user.id, action: 'auth.registered', entity: 'users', entityId: user.id, meta });
    void this.sendVerificationEmail(user.id, user.email, user.firstName);

    const tokens = await this.tokens.issue({ id: user.id, email: user.email, roles: ['CUSTOMER'] }, meta);
    return { user: toAuthUser(user), tokens };
  }

  async login(dto: LoginDto, meta: RequestMeta): Promise<{ user: AuthUser; tokens: IssuedTokens }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { ...authUserSelect, passwordHash: true },
    });

    if (!user) {
      // Equalise timing so attackers cannot enumerate registered emails.
      this.dummyHash ??= this.passwords.hash('timing-equaliser-password-1');
      await this.passwords.verify(await this.dummyHash, dto.password);
      this.logger.warn(`Failed login for unknown email from ${meta.ip ?? '-'}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await this.passwords.verify(user.passwordHash, dto.password);
    if (!valid) {
      await this.audit.log({ actorId: user.id, action: 'auth.login_failed', entity: 'users', entityId: user.id, meta });
      throw new UnauthorizedException('Invalid email or password');
    }
    if (user.status !== 'ACTIVE') {
      await this.audit.log({ actorId: user.id, action: 'auth.login_blocked', entity: 'users', entityId: user.id, meta });
      throw new ForbiddenException('This account has been disabled. Please contact us for assistance.');
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await this.audit.log({ actorId: user.id, action: 'auth.login', entity: 'users', entityId: user.id, meta });

    const { passwordHash: _omit, ...safe } = user;
    const authUser = toAuthUser(safe);
    const tokens = await this.tokens.issue({ id: user.id, email: user.email, roles: authUser.roles }, meta);
    return { user: authUser, tokens };
  }

  async refresh(refreshToken: string | undefined, meta: RequestMeta): Promise<{ user: AuthUser; tokens: IssuedTokens }> {
    if (!refreshToken) throw new UnauthorizedException('No active session');
    const { userId, tokens } = await this.tokens.rotate(refreshToken, meta);
    return { user: await this.me(userId), tokens };
  }

  async logout(refreshToken: string | undefined, actorId: string | undefined, meta: RequestMeta): Promise<void> {
    await this.tokens.revoke(refreshToken);
    if (actorId) await this.audit.log({ actorId, action: 'auth.logout', entity: 'users', entityId: actorId, meta });
  }

  async me(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: authUserSelect });
    if (!user) throw new UnauthorizedException('Account not found');
    return toAuthUser(user);
  }

  /** Always resolves (no account enumeration). Sends a reset link when the account exists. */
  async forgotPassword(email: string, meta: RequestMeta): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== 'ACTIVE') return;

    const token = generateToken(32);
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + RESET_TTL_MS) },
    });
    await this.audit.log({ actorId: user.id, action: 'auth.password_reset_requested', entity: 'users', entityId: user.id, meta });

    const { companyName } = await this.settings.getAll();
    const link = `${this.config.env.WEB_URL}/reset-password?token=${encodeURIComponent(token)}`;
    void this.mail.send({
      to: user.email,
      subject: `Reset your ${companyName} password`,
      html: emailLayout(
        companyName,
        'Reset your password',
        paragraph(`Hello ${user.firstName}, we received a request to reset your password.`) +
          button(link, 'Choose a new password') +
          paragraph('This link expires in 1 hour. If you did not request a reset, you can ignore this email.'),
      ),
      text: `Hello ${user.firstName},\n\nReset your password: ${link}\n\nThis link expires in 1 hour.`,
    });
  }

  async resetPassword(dto: ResetPasswordDto, meta: RequestMeta): Promise<void> {
    const record = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256(dto.token) } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('This reset link is invalid or has expired');
    }
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: await this.passwords.hash(dto.password) },
      }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);
    await this.tokens.revokeAllForUser(record.userId);
    await this.audit.log({ actorId: record.userId, action: 'auth.password_reset', entity: 'users', entityId: record.userId, meta });
  }

  async changePassword(userId: string, dto: ChangePasswordDto, meta: RequestMeta): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!(await this.passwords.verify(user.passwordHash, dto.currentPassword))) {
      throw new BadRequestException('Current password is incorrect');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await this.passwords.hash(dto.newPassword) },
    });
    await this.tokens.revokeAllForUser(userId);
    await this.audit.log({ actorId: userId, action: 'auth.password_changed', entity: 'users', entityId: userId, meta });
  }

  async verifyEmail(token: string): Promise<void> {
    const record = await this.prisma.emailVerificationToken.findUnique({ where: { tokenHash: sha256(token) } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('This verification link is invalid or has expired');
    }
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
      this.prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);
  }

  async resendVerification(userId: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.emailVerifiedAt) return;
    await this.sendVerificationEmail(user.id, user.email, user.firstName);
  }

  private async sendVerificationEmail(userId: string, email: string, firstName: string): Promise<void> {
    try {
      const token = generateToken(32);
      await this.prisma.emailVerificationToken.create({
        data: { userId, tokenHash: sha256(token), expiresAt: new Date(Date.now() + VERIFY_TTL_MS) },
      });
      const { companyName } = await this.settings.getAll();
      const link = `${this.config.env.WEB_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;
      await this.mail.send({
        to: email,
        subject: `Verify your email — ${companyName}`,
        html: emailLayout(
          companyName,
          'Confirm your email address',
          paragraph(`Welcome ${firstName}! Please confirm your email address to secure your account.`) +
            button(link, 'Verify email') +
            paragraph('This link expires in 48 hours.'),
        ),
        text: `Welcome ${firstName}!\n\nVerify your email: ${link}\n\nThis link expires in 48 hours.`,
      });
    } catch (error) {
      this.logger.error(`Could not send verification email: ${(error as Error).message}`);
    }
  }
}
