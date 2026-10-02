import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './helpers';

describe('Auth (e2e)', () => {
  let app: NestExpressApplication;
  const email = `auth.${Date.now()}@example.com`;

  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(() => app.close());

  const cookie = (res: request.Response, name: string) =>
    ([] as string[]).concat(res.headers['set-cookie'] ?? []).find((c) => c.startsWith(`${name}=`));

  it('registers a customer and sets HTTP-only session cookies', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ firstName: 'Test', lastName: 'Customer', email, phone: '+971501234567', password: 'Password123' })
      .expect(201);
    expect(res.body.user).toMatchObject({ email, roles: ['CUSTOMER'], emailVerified: false });
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(cookie(res, 'hu_at')).toMatch(/HttpOnly/);
    expect(cookie(res, 'hu_rt')).toMatch(/SameSite=Lax/);
  });

  it('stores an Argon2 hash, never the plain password', async () => {
    const user = await app.get(PrismaService).user.findUniqueOrThrow({ where: { email } });
    expect(user.passwordHash).toMatch(/^\$argon2id\$/);
    expect(user.passwordHash).not.toContain('Password123');
  });

  it('rejects duplicate registrations', () =>
    request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ firstName: 'A', lastName: 'B', email, phone: '+971501234567', password: 'Password123' })
      .expect(409));

  it('validates registration input', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/auth/register').send({ email: 'bad', password: '123' }).expect(400);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  it('rejects invalid credentials with a generic message', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password: 'WrongPass1' }).expect(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('logs in, reads /me, rotates the refresh token and logs out', async () => {
    const agent = request.agent(app.getHttpServer());
    const login = await agent.post('/api/v1/auth/login').send({ email, password: 'Password123' }).expect(200);
    expect(login.body.accessToken).toBeTruthy();

    await agent.get('/api/v1/auth/me').expect(200).expect((r) => expect(r.body.email).toBe(email));

    // Bearer tokens work for API clients too
    await request(app.getHttpServer()).get('/api/v1/auth/me').set('Authorization', `Bearer ${login.body.accessToken}`).expect(200);

    const oldRefresh = cookie(login, 'hu_rt')!.split(';')[0].split('=')[1];
    const refreshed = await agent.post('/api/v1/auth/refresh').send({}).expect(200);
    const newRefresh = cookie(refreshed, 'hu_rt')!.split(';')[0].split('=')[1];
    expect(newRefresh).not.toBe(oldRefresh);

    // Re-using the rotated token is detected and the family is revoked
    await request(app.getHttpServer()).post('/api/v1/auth/refresh').send({ refreshToken: oldRefresh }).expect(401);
    await request(app.getHttpServer()).post('/api/v1/auth/refresh').send({ refreshToken: newRefresh }).expect(401);

    await agent.post('/api/v1/auth/logout').send({}).expect(204);
  });

  it('requires authentication for protected routes', () => request(app.getHttpServer()).get('/api/v1/auth/me').expect(401));

  it('handles forgot / reset password without revealing accounts', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/forgot-password').send({ email: 'nobody@example.com' }).expect(200);
    await request(app.getHttpServer()).post('/api/v1/auth/forgot-password').send({ email }).expect(200);
    await request(app.getHttpServer()).post('/api/v1/auth/reset-password').send({ token: 'invalid', password: 'NewPassword1' }).expect(400);
    const prisma = app.get(PrismaService);
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(await prisma.passwordResetToken.count({ where: { userId: user.id, usedAt: null } })).toBe(1);
  });

  it('blocks disabled accounts', async () => {
    const prisma = app.get(PrismaService);
    await prisma.user.update({ where: { email }, data: { status: 'DISABLED' } });
    await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password: 'Password123' }).expect(403);
    await prisma.user.update({ where: { email }, data: { status: 'ACTIVE' } });
  });
});
