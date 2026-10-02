import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AccessTokenPayload, AuthenticatedRequest } from '../types/request-user';
import { ACCESS_COOKIE } from '../utils/cookies';

/**
 * Global authentication guard.
 *
 * Reads the access token from the `Authorization: Bearer` header (API clients / Swagger) or the
 * HTTP-only `hu_at` cookie (browser). The user is re-loaded from the database on every request so
 * that disabled accounts and role changes take effect immediately.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      if (isPublic) return true;
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          status: true,
          roles: { select: { role: { select: { name: true } } } },
        },
      });
      if (!user || user.status !== 'ACTIVE') throw new UnauthorizedException('Account is not active');
      request.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((r) => r.role.name),
      };
      return true;
    } catch (error) {
      if (isPublic) return true;
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired session');
    }
  }

  private extractToken(request: AuthenticatedRequest): string | null {
    const header = request.headers.authorization;
    if (header?.startsWith('Bearer ')) return header.slice(7).trim() || null;
    const cookies = request.cookies as Record<string, string> | undefined;
    return cookies?.[ACCESS_COOKIE] ?? null;
  }
}
