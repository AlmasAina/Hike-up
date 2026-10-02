import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { createTestApp, loginAgent } from './helpers';
import { TEST_ENV } from './test-env';

describe('Role based access control (e2e)', () => {
  let app: NestExpressApplication;
  let admin: request.Agent;
  let staff: request.Agent;
  let customer: request.Agent;

  beforeAll(async () => {
    app = await createTestApp();
    admin = await loginAgent(app, TEST_ENV.SEED_ADMIN_EMAIL, TEST_ENV.SEED_ADMIN_PASSWORD);
    staff = await loginAgent(app, 'demo.staff@example.com', TEST_ENV.SEED_DEMO_PASSWORD);
    customer = await loginAgent(app, 'demo.customer@example.com', TEST_ENV.SEED_DEMO_PASSWORD);
  });
  afterAll(() => app.close());

  it.each(['/admin/dashboard', '/admin/services', '/admin/customers', '/admin/settings', '/admin/technicians'])('customer cannot access %s', (path) =>
    customer.get(`/api/v1${path}`).expect(403),
  );

  it.each(['/admin/dashboard', '/admin/services', '/admin/customers', '/admin/settings', '/admin/users', '/admin/audit-logs'])('staff cannot access %s', (path) =>
    staff.get(`/api/v1${path}`).expect(403),
  );

  it('staff can list only their assigned requests', async () => {
    const mine = await staff.get('/api/v1/admin/quote-requests?pageSize=100').expect(200);
    const all = await admin.get('/api/v1/admin/quote-requests?pageSize=100').expect(200);
    await request(app.getHttpServer()).post('/api/v1/quote-requests').send({
      firstName: 'Unassigned', lastName: 'Guest', email: 'unassigned@example.com', phone: '0501231234', location: 'Abu Dhabi',
      propertyType: 'VILLA', preferredContact: 'PHONE', description: 'Unassigned request for RBAC test.',
    }).expect(201);
    const mineAfter = await staff.get('/api/v1/admin/quote-requests?pageSize=100').expect(200);
    expect(mineAfter.body.total).toBe(mine.body.total);
    expect(mine.body.items.every((r: { technicians: { name: string }[] }) => r.technicians.some((t) => t.name === 'Demo Technician'))).toBe(true);
    expect(all.body.total).toBeGreaterThanOrEqual(mine.body.total);
  });

  it('admin can access management endpoints', async () => {
    await admin.get('/api/v1/admin/dashboard').expect(200);
    await admin.get('/api/v1/admin/customers').expect(200);
    await admin.get('/api/v1/admin/audit-logs').expect(200);
  });

  it('anonymous users get 401 on admin routes', () => request(app.getHttpServer()).get('/api/v1/admin/services').expect(401));

  it('admin users endpoint is SUPER_ADMIN only', async () => {
    await admin.get('/api/v1/admin/users').expect(200);
    const created = await admin
      .post('/api/v1/admin/users')
      .send({ email: `manager.${Date.now()}@example.com`, firstName: 'Ops', lastName: 'Manager', role: 'ADMIN', password: 'Password123' })
      .expect(201);
    const manager = await loginAgent(app, created.body.email, 'Password123');
    await manager.get('/api/v1/admin/services').expect(200);
    await manager.get('/api/v1/admin/users').expect(403);
  });
});
