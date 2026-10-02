import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { createTestApp, loginAgent, TINY_PNG } from './helpers';
import { TEST_ENV } from './test-env';

describe('Quote requests & contact (e2e)', () => {
  let app: NestExpressApplication;
  let admin: request.Agent;
  let staff: request.Agent;
  let customer: request.Agent;
  let requestId: string;
  let imageUrl: string;
  const server = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
    admin = await loginAgent(app, TEST_ENV.SEED_ADMIN_EMAIL, TEST_ENV.SEED_ADMIN_PASSWORD);
    staff = await loginAgent(app, 'demo.staff@example.com', TEST_ENV.SEED_DEMO_PASSWORD);
    customer = await loginAgent(app, 'demo.customer@example.com', TEST_ENV.SEED_DEMO_PASSWORD);
  });
  afterAll(() => app.close());

  const fields = {
    firstName: 'Demo',
    lastName: 'Customer',
    email: 'demo.customer@example.com',
    phone: '0501234567',
    location: 'Al Reem Island, Abu Dhabi',
    propertyType: 'APARTMENT',
    preferredContact: 'WHATSAPP',
    description: 'Kitchen sink is leaking under the cabinet.',
  };

  it('accepts a guest submission without images', async () => {
    const res = await server().post('/api/v1/quote-requests').send({ ...fields, email: 'guest@example.com' }).expect(201);
    expect(res.body.reference).toMatch(/^HU-\d{4}-\d{6}$/);
    expect(res.body.status).toBe('NEW');
  });

  it('accepts a multipart submission with images from a signed-in customer', async () => {
    const services = await server().get('/api/v1/services').expect(200);
    const plumbing = services.body.find((s: { slug: string }) => s.slug === 'plumbing-services');
    let req = customer.post('/api/v1/quote-requests');
    for (const [k, v] of Object.entries({ ...fields, serviceId: plumbing.id })) req = req.field(k, v);
    const res = await req.attach('images', TINY_PNG, { filename: 'leak.png', contentType: 'image/png' }).expect(201);
    requestId = res.body.id;
  });

  it('rejects invalid submissions and unsafe files', async () => {
    await server().post('/api/v1/quote-requests').send({ ...fields, propertyType: 'CASTLE' }).expect(400);
    await server().post('/api/v1/quote-requests').send({ ...fields, description: 'short' }).expect(400);
    await server().post('/api/v1/quote-requests').send({ ...fields, website: 'http://spam' }).expect(400);
    let req = server().post('/api/v1/quote-requests');
    for (const [k, v] of Object.entries(fields)) req = req.field(k, v);
    await req.attach('images', Buffer.from('<html>evil</html>'), { filename: 'a.png', contentType: 'image/png' }).expect(400);
  });

  it('shows the request in the customer dashboard', async () => {
    const dash = await customer.get('/api/v1/customer/dashboard').expect(200);
    expect(dash.body.total).toBeGreaterThanOrEqual(1);
    const detail = await customer.get(`/api/v1/customer/quote-requests/${requestId}`).expect(200);
    expect(detail.body.images).toHaveLength(1);
    expect(detail.body.statusHistory[0].toStatus).toBe('NEW');
    imageUrl = detail.body.images[0].url;
  });

  it('protects private request images', async () => {
    const path = imageUrl.replace('/api/v1', '/api/v1');
    await customer.get(path).expect(200).expect('Content-Type', /image\/png/);
    await admin.get(path).expect(200);
    await server().get(path).expect(401);
    await staff.get(path).expect(403);
  });

  it('notifies admins and lets them search and filter', async () => {
    const list = await admin.get('/api/v1/admin/quote-requests?status=NEW&search=Al%20Reem').expect(200);
    expect(list.body.items.length).toBeGreaterThanOrEqual(1);
    const notes = await admin.get('/api/v1/notifications').expect(200);
    expect(notes.body.items.some((n: { type: string }) => n.type === 'QUOTE_REQUEST_CREATED')).toBe(true);
  });

  it('assigns staff, who can then update only that request', async () => {
    const techs = await admin.get('/api/v1/admin/technicians').expect(200);
    const tech = techs.body.items.find((t: { userId: string | null }) => t.userId);
    await staff.get(`/api/v1/admin/quote-requests/${requestId}`).expect(403);
    await staff.post(`/api/v1/admin/quote-requests/${requestId}/assignments`).send({ technicianId: tech.id }).expect(403);
    await admin.post(`/api/v1/admin/quote-requests/${requestId}/assignments`).send({ technicianId: tech.id }).expect(201);
    await staff.get(`/api/v1/admin/quote-requests/${requestId}`).expect(200);
    await staff.patch(`/api/v1/admin/quote-requests/${requestId}`).send({ status: 'CONTACTED', note: 'Called the customer' }).expect(200);
    await staff.post(`/api/v1/admin/quote-requests/${requestId}/notes`).send({ body: 'Needs a new trap.' }).expect(201);
  });

  it('updates status with history and customer visibility (internal notes stay private)', async () => {
    await admin.patch(`/api/v1/admin/quote-requests/${requestId}`).send({ status: 'QUOTED' }).expect(200);
    await admin.patch(`/api/v1/admin/quote-requests/${requestId}`).send({ status: 'BOOKED' }).expect(400);
    const detail = await customer.get(`/api/v1/customer/quote-requests/${requestId}`).expect(200);
    expect(detail.body.status).toBe('QUOTED');
    expect(detail.body.statusHistory.map((h: { toStatus: string }) => h.toStatus)).toEqual(['NEW', 'CONTACTED', 'QUOTED']);
    expect(detail.body.internalNotes).toBeUndefined();
    const notes = await customer.get('/api/v1/notifications').expect(200);
    expect(notes.body.items.some((n: { type: string }) => n.type === 'QUOTE_STATUS_CHANGED')).toBe(true);
  });

  it('supports customer ⇄ team messages and extra uploads', async () => {
    await customer.post(`/api/v1/customer/quote-requests/${requestId}/messages`).send({ body: 'Is Monday possible?' }).expect(201);
    await admin.post(`/api/v1/admin/quote-requests/${requestId}/messages`).send({ body: 'Yes, Monday at 10am.' }).expect(201);
    const msgs = await customer.get(`/api/v1/customer/quote-requests/${requestId}/messages`).expect(200);
    expect(msgs.body.map((m: { fromStaff: boolean }) => m.fromStaff)).toEqual([false, true]);
    await customer.post(`/api/v1/customer/quote-requests/${requestId}/images`).attach('images', TINY_PNG, { filename: 'b.png', contentType: 'image/png' }).expect(201);
  });

  it('prevents customers from reading other customers’ requests', async () => {
    const other = request.agent(app.getHttpServer());
    await other.post('/api/v1/auth/register').send({ firstName: 'O', lastName: 'Ther', email: `other.${Date.now()}@example.com`, phone: '+971501111111', password: 'Password123' }).expect(201);
    await other.get(`/api/v1/customer/quote-requests/${requestId}`).expect(404);
  });

  it('stores contact messages and lets admins manage them', async () => {
    await server().post('/api/v1/contact').send({ name: 'Visitor', email: 'v@example.com', subject: 'Hello', message: 'Do you work in Al Ain?' }).expect(201);
    await server().post('/api/v1/contact').send({ name: 'V', email: 'nope', subject: '', message: 'x' }).expect(400);
    const list = await admin.get('/api/v1/admin/contact-messages').expect(200);
    const msg = list.body.items[0];
    await admin.get(`/api/v1/admin/contact-messages/${msg.id}`).expect(200).expect((r) => expect(r.body.status).toBe('READ'));
    await admin.patch(`/api/v1/admin/contact-messages/${msg.id}`).send({ status: 'ARCHIVED' }).expect(200);
  });

  it('reports health', () => server().get('/api/v1/health').expect(200).expect((r) => expect(r.body.database).toBe('up')));
});
