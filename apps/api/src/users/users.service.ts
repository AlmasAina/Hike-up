import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type RoleName, type UserStatus } from '@prisma/client';
import type { AuthUser, CustomerQuoteRequest, CustomerSummary, Paginated } from '@hikeup/types';
import { AuditService } from '../audit/audit.service';
import { AuthService } from '../auth/auth.service';
import { PasswordService } from '../auth/password.service';
import { TokenService } from '../auth/token.service';
import type { RequestMeta } from '../common/decorators/request-meta.decorator';
import { paginate, skipTake } from '../common/utils/pagination';
import { sanitizePlainText } from '../common/utils/sanitize';
import { PrismaService } from '../prisma/prisma.service';
import { customerInclude, toCustomerRequest } from '../quote-requests/quote-request.mapper';
import type { UploadedImageFile } from '../storage/image-validation';
import { StorageService } from '../storage/storage.service';
import type { CreateAdminUserDto, CustomerQueryDto, UpdateAdminUserDto, UpdateProfileDto } from './dto/users.dto';
import { authUserSelect, toAuthUser } from './user.mapper';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
    private readonly auth: AuthService,
    private readonly audit: AuditService,
  ) {}

  // ───────────────────────────── own profile ──

  async updateProfile(userId: string, dto: UpdateProfileDto, meta: RequestMeta): Promise<AuthUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName ? sanitizePlainText(dto.firstName) : undefined,
        lastName: dto.lastName ? sanitizePlainText(dto.lastName) : undefined,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
      },
      select: authUserSelect,
    });
    await this.audit.log({ actorId: userId, action: 'profile.updated', entity: 'users', entityId: userId, meta, metadata: { fields: Object.keys(dto) } });
    return toAuthUser(user);
  }

  async updateAvatar(userId: string, file: UploadedImageFile, meta: RequestMeta): Promise<AuthUser> {
    const existing = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { avatarKey: true } });
    const stored = await this.storage.uploadImage(file, 'avatars', 'public');
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: stored.url, avatarKey: stored.key },
      select: authUserSelect,
    });
    await this.storage.delete(existing.avatarKey);
    await this.audit.log({ actorId: userId, action: 'profile.avatar_updated', entity: 'users', entityId: userId, meta });
    return toAuthUser(user);
  }

  // ───────────────────────────── customers ──

  async listCustomers(query: CustomerQueryDto): Promise<Paginated<CustomerSummary>> {
    const where: Prisma.UserWhereInput = {
      roles: { some: { role: { name: 'CUSTOMER' } } },
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { email: { contains: query.search, mode: 'insensitive' } },
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: query.order },
        ...skipTake(query.page, query.pageSize),
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          whatsapp: true,
          status: true,
          emailVerifiedAt: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { quoteRequests: { where: { deletedAt: null } } } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return paginate(
      rows.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        whatsapp: u.whatsapp,
        status: u.status,
        emailVerified: Boolean(u.emailVerifiedAt),
        requestCount: u._count.quoteRequests,
        createdAt: u.createdAt.toISOString(),
        lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
      })),
      total,
      query.page,
      query.pageSize,
    );
  }

  async getCustomer(id: string): Promise<{ customer: AuthUser & { lastLoginAt: string | null }; requests: CustomerQuoteRequest[] }> {
    const user = await this.prisma.user.findFirst({
      where: { id, roles: { some: { role: { name: 'CUSTOMER' } } } },
      select: { ...authUserSelect, lastLoginAt: true },
    });
    if (!user) throw new NotFoundException('Customer not found');
    const requests = await this.prisma.quoteRequest.findMany({
      where: { customerId: id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: customerInclude,
    });
    return {
      customer: { ...toAuthUser(user), lastLoginAt: user.lastLoginAt?.toISOString() ?? null },
      requests: requests.map(toCustomerRequest),
    };
  }

  async setCustomerStatus(id: string, status: UserStatus, actorId: string, meta: RequestMeta): Promise<void> {
    const user = await this.prisma.user.findFirst({ where: { id, roles: { some: { role: { name: 'CUSTOMER' } } } } });
    if (!user) throw new NotFoundException('Customer not found');
    await this.prisma.user.update({ where: { id }, data: { status } });
    if (status === 'DISABLED') await this.tokens.revokeAllForUser(id);
    await this.audit.log({ actorId, action: status === 'DISABLED' ? 'customer.disabled' : 'customer.enabled', entity: 'users', entityId: id, meta });
  }

  /** Sends the customer a password reset link. Admins never see or set customer passwords. */
  async sendCustomerPasswordReset(id: string, actorId: string, meta: RequestMeta): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Customer not found');
    if (user.status !== 'ACTIVE') throw new BadRequestException('Enable the account before sending a reset link');
    await this.auth.forgotPassword(user.email, meta);
    await this.audit.log({ actorId, action: 'customer.password_reset_sent', entity: 'users', entityId: id, meta });
  }

  // ───────────────────────────── back-office users ──

  async listAdmins(query: CustomerQueryDto) {
    const where: Prisma.UserWhereInput = {
      roles: { some: { role: { name: { in: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] } } } },
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { email: { contains: query.search, mode: 'insensitive' } },
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: query.order },
        ...skipTake(query.page, query.pageSize),
        select: { ...authUserSelect, lastLoginAt: true },
      }),
      this.prisma.user.count({ where }),
    ]);
    return paginate(
      rows.map((u) => ({ ...toAuthUser(u), lastLoginAt: u.lastLoginAt?.toISOString() ?? null })),
      total,
      query.page,
      query.pageSize,
    );
  }

  async createAdmin(dto: CreateAdminUserDto, actorId: string, meta: RequestMeta): Promise<AuthUser> {
    if (await this.prisma.user.findUnique({ where: { email: dto.email } })) {
      throw new ConflictException('A user with this email already exists');
    }
    const role = await this.prisma.role.findUniqueOrThrow({ where: { name: dto.role } });
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash: await this.passwords.hash(dto.password),
        emailVerifiedAt: new Date(),
        roles: { create: { roleId: role.id } },
      },
      select: authUserSelect,
    });
    await this.audit.log({ actorId, action: 'admin_user.created', entity: 'users', entityId: user.id, meta, metadata: { role: dto.role } });
    return toAuthUser(user);
  }

  async updateAdmin(id: string, dto: UpdateAdminUserDto, actorId: string, meta: RequestMeta): Promise<AuthUser> {
    if (id === actorId) throw new BadRequestException('You cannot change your own role or status');
    const user = await this.prisma.user.findFirst({
      where: { id, roles: { some: { role: { name: { in: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] } } } } },
      include: { roles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException('User not found');

    if (dto.role) {
      const role = await this.prisma.role.findUniqueOrThrow({ where: { name: dto.role } });
      const backOffice: RoleName[] = ['SUPER_ADMIN', 'ADMIN', 'STAFF'];
      await this.prisma.$transaction([
        this.prisma.userRole.deleteMany({ where: { userId: id, role: { name: { in: backOffice } } } }),
        this.prisma.userRole.create({ data: { userId: id, roleId: role.id } }),
      ]);
    }
    if (dto.status) {
      await this.prisma.user.update({ where: { id }, data: { status: dto.status } });
      if (dto.status === 'DISABLED') await this.tokens.revokeAllForUser(id);
    }
    await this.audit.log({ actorId, action: 'admin_user.updated', entity: 'users', entityId: id, meta, metadata: { ...dto } });
    const updated = await this.prisma.user.findUniqueOrThrow({ where: { id }, select: authUserSelect });
    return toAuthUser(updated);
  }
}
