import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AppConfig } from '../config/app-config';
import type { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './token.service';

interface Row {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedById: string | null;
}

/** In-memory fake of the refresh_tokens table. */
function fakePrisma() {
  const rows: Row[] = [];
  let seq = 0;
  const user = { id: 'user-1', email: 'a@b.c', status: 'ACTIVE', roles: [{ role: { name: 'CUSTOMER' } }] };
  const match = (r: Row, where: Partial<Row>) => Object.entries(where).every(([k, v]) => (r as unknown as Record<string, unknown>)[k] === v);
  const prisma = {
    refreshToken: {
      create: jest.fn(async ({ data }: { data: Row }) => {
        const row = { ...data, id: `rt-${++seq}`, revokedAt: null, replacedById: null };
        rows.push(row);
        return row;
      }),
      findUnique: jest.fn(async ({ where, include }: { where: { tokenHash: string }; include?: unknown }) => {
        const row = rows.find((r) => r.tokenHash === where.tokenHash);
        return row ? { ...row, ...(include ? { user } : {}) } : null;
      }),
      updateMany: jest.fn(async ({ where, data }: { where: Partial<Row>; data: Partial<Row> }) => {
        const hits = rows.filter((r) => match(r, where));
        hits.forEach((r) => Object.assign(r, data));
        return { count: hits.length };
      }),
    },
  };
  return { prisma: prisma as unknown as PrismaService, rows };
}

describe('TokenService', () => {
  const config = { env: { JWT_REFRESH_SECRET: 'r'.repeat(40), JWT_ACCESS_TTL_SECONDS: 900, JWT_REFRESH_TTL_DAYS: 30 } } as unknown as AppConfig;
  const jwt = new JwtService({ secret: 's'.repeat(40) });
  const meta = { ip: '127.0.0.1', userAgent: 'jest' };

  it('stores only a hash of the refresh token', async () => {
    const { prisma, rows } = fakePrisma();
    const service = new TokenService(jwt, prisma, config);
    const issued = await service.issue({ id: 'user-1', email: 'a@b.c', roles: ['CUSTOMER'] }, meta);
    expect(rows[0].tokenHash).toHaveLength(64);
    expect(rows[0].tokenHash).not.toContain(issued.refreshToken);
    expect(jwt.decode(issued.accessToken)).toMatchObject({ sub: 'user-1', roles: ['CUSTOMER'] });
  });

  it('rotates tokens within the same family', async () => {
    const { prisma, rows } = fakePrisma();
    const service = new TokenService(jwt, prisma, config);
    const first = await service.issue({ id: 'user-1', email: 'a@b.c', roles: ['CUSTOMER'] }, meta);
    const { tokens } = await service.rotate(first.refreshToken, meta);
    expect(tokens.refreshToken).not.toBe(first.refreshToken);
    expect(rows[0].revokedAt).not.toBeNull();
    expect(rows[1].familyId).toBe(rows[0].familyId);
  });

  it('revokes the whole family when a rotated token is reused', async () => {
    const { prisma, rows } = fakePrisma();
    const service = new TokenService(jwt, prisma, config);
    const first = await service.issue({ id: 'user-1', email: 'a@b.c', roles: ['CUSTOMER'] }, meta);
    await service.rotate(first.refreshToken, meta);
    await expect(service.rotate(first.refreshToken, meta)).rejects.toThrow(UnauthorizedException);
    expect(rows.every((r) => r.revokedAt)).toBe(true);
  });

  it('rejects unknown tokens', async () => {
    const { prisma } = fakePrisma();
    const service = new TokenService(jwt, prisma, config);
    await expect(service.rotate('nope', meta)).rejects.toThrow(UnauthorizedException);
  });
});
