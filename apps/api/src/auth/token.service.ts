import { randomUUID } from 'node:crypto';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { RoleName } from '@prisma/client';
import type { RequestMeta } from '../common/decorators/request-meta.decorator';
import type { AccessTokenPayload } from '../common/types/request-user';
import { generateToken, hmacToken } from '../common/utils/crypto';
import { AppConfig } from '../config/app-config';
import { PrismaService } from '../prisma/prisma.service';

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresAt: Date;
}

/**
 * Access tokens: short-lived JWTs (HS256, JWT_SECRET).
 * Refresh tokens: opaque random strings stored as HMAC-SHA256 (JWT_REFRESH_SECRET) hashes, rotated
 * on every use. Presenting an already-rotated token revokes the whole token family.
 */
@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: AppConfig,
  ) {}

  private hash(token: string): string {
    return hmacToken(token, this.config.env.JWT_REFRESH_SECRET);
  }

  async issue(
    user: { id: string; email: string; roles: RoleName[] },
    meta: RequestMeta,
    familyId: string = randomUUID(),
  ): Promise<IssuedTokens & { refreshTokenId: string }> {
    const payload: AccessTokenPayload = { sub: user.id, email: user.email, roles: user.roles };
    const accessExpiresIn = this.config.env.JWT_ACCESS_TTL_SECONDS;
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: accessExpiresIn });
    const refreshToken = generateToken();
    const refreshExpiresAt = new Date(Date.now() + this.config.env.JWT_REFRESH_TTL_DAYS * 86_400_000);
    const record = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hash(refreshToken),
        familyId,
        expiresAt: refreshExpiresAt,
        ip: meta.ip,
        userAgent: meta.userAgent,
      },
    });
    return { accessToken, refreshToken, accessExpiresIn, refreshExpiresAt, refreshTokenId: record.id };
  }

  /** Validates and rotates a refresh token. Returns the owning user id and new tokens. */
  async rotate(presented: string, meta: RequestMeta) {
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hash(presented) },
      include: {
        user: {
          select: { id: true, email: true, status: true, roles: { select: { role: { select: { name: true } } } } },
        },
      },
    });
    if (!existing) throw new UnauthorizedException('Invalid session');

    if (existing.revokedAt) {
      // Re-use of a rotated token: likely theft. Revoke the whole family.
      await this.revokeFamily(existing.familyId);
      this.logger.warn(`Refresh token reuse detected for user ${existing.userId}; family revoked`);
      throw new UnauthorizedException('Session expired, please sign in again');
    }
    if (existing.expiresAt < new Date() || existing.user.status !== 'ACTIVE') {
      await this.revokeFamily(existing.familyId);
      throw new UnauthorizedException('Session expired, please sign in again');
    }

    const user = {
      id: existing.user.id,
      email: existing.user.email,
      roles: existing.user.roles.map((r) => r.role.name),
    };
    const issued = await this.issue(user, meta, existing.familyId);
    const updated = await this.prisma.refreshToken.updateMany({
      where: { id: existing.id, revokedAt: null },
      data: { revokedAt: new Date(), replacedById: issued.refreshTokenId },
    });
    if (updated.count === 0) {
      // Concurrent rotation of the same token — treat as reuse.
      await this.revokeFamily(existing.familyId);
      throw new UnauthorizedException('Session expired, please sign in again');
    }
    return { userId: user.id, tokens: issued };
  }

  async revoke(presented: string | undefined): Promise<void> {
    if (!presented) return;
    const existing = await this.prisma.refreshToken.findUnique({ where: { tokenHash: this.hash(presented) } });
    if (existing) await this.revokeFamily(existing.familyId);
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  /** Housekeeping: delegates to the purge_expired_tokens() stored procedure. */
  async purgeExpired(): Promise<void> {
    await this.prisma.$executeRaw`CALL purge_expired_tokens()`;
  }
}
