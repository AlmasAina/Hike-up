import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { createTestApp, loginAgent, TINY_PNG } from './helpers';
import { TEST_ENV } from './test-env';

describe('Content management (e2e)', () => {
  let app: NestExpressApplication;
  let admin: request.Agent;
  const server = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
    admin = await loginAgent(app, TEST_ENV.SEED_ADMIN_EMAIL, TEST_ENV.SEED_ADMIN_PASSWORD);
  });
  afterAll(() => app.close());

  it('serves seeded public content', async () => {
    const services = await server().get('/api/v1/services').expect(200);
    expect(services.body).toHaveLength(10);
    const detail = await server().get('/api/v1/services/plumbing-services').expect(200);
    expect(detail.body.features.length).toBeGreaterThan(0);
    expect(detail.body.relatedServices.length).toBeGreaterThan(0);
    const pkgs = await server().get('/api/v1/packages').expect(200);
    expect(pkgs.body.packages.map((p: { name: string }) => p.name)).toEqual(['Bronze', 'Silver', 'Gold']);
    expect(pkgs.body.packages.every((p: { priceLabel: string | null }) => p.priceLabel === null)).toBe(true);
    expect(pkgs.body.comparisonRows).toHaveLength(8);
    await server().get('/api/v1/faqs').expect(200).expect((r) => expect(r.body).toHaveLength(10));
    // Sample testimonials & demo projects stay unpublished unless explicitly enabled
    await server().get('/api/v1/testimonials').expect(200).expect((r) => expect(r.body).toHaveLength(0));
    await server().get('/api/v1/legal/privacy-policy').expect(200);
    const settings = await server().get('/api/v1/settings').expect(200);
    expect(settings.body.phone).toBe(TEST_ENV.COMPANY_PHONE);
    expect(settings.body.notificationEmail).toBeUndefined();
  });

  it('runs the full service lifecycle: create → publish → update → delete', async () => {
    const created = await admin
      .post('/api/v1/admin/services')
      .send({
        title: 'Pool Maintenance',
        shortDescription: 'Cleaning and maintenance for private pools.',
        description: '<p>Safe <strong>pool</strong> care.<script>alert(1)</script></p>',
        icon: 'droplets',
        features: [{ type: 'COVERAGE', title: 'Filter cleaning' }],
        faqs: [{ question: 'Weekly visits?', answer: 'Yes.' }],
      })
      .expect(201);
    expect(created.body.slug).toBe('pool-maintenance');
    expect(created.body.status).toBe('DRAFT');
    expect(created.body.description).not.toContain('<script>');

    await server().get('/api/v1/services/pool-maintenance').expect(404);
    await admin.patch(`/api/v1/admin/services/${created.body.id}`).send({ status: 'PUBLISHED', seoTitle: 'Pool Maintenance Abu Dhabi' }).expect(200);
    const pub = await server().get('/api/v1/services/pool-maintenance').expect(200);
    expect(pub.body.seoTitle).toBe('Pool Maintenance Abu Dhabi');

    await admin.delete(`/api/v1/admin/services/${created.body.id}`).expect(204);
    await server().get('/api/v1/services/pool-maintenance').expect(404);
    // The slug can be reused after deletion
    await admin.post('/api/v1/admin/services').send({ title: 'Pool Maintenance', shortDescription: 'Again a pool service.', description: '<p>x</p>' }).expect(201);

    const logs = await admin.get('/api/v1/admin/audit-logs?entity=services').expect(200);
    expect(logs.body.items.map((l: { action: string }) => l.action)).toEqual(expect.arrayContaining(['service.created', 'service.published', 'service.deleted']));
  });

  it('manages packages, features and comparison values', async () => {
    const { body } = await admin.get('/api/v1/admin/packages').expect(200);
    const row = body.comparisonRows[0];
    const created = await admin
      .post('/api/v1/admin/packages')
      .send({
        name: 'Platinum',
        color: '#5B6B82',
        priceLabel: 'On request',
        featured: true,
        features: [
          { label: 'Dedicated account manager', availability: 'INCLUDED' },
          { comparisonRowId: row.id, label: row.label, availability: 'CUSTOM', value: 'Same day' },
        ],
      })
      .expect(201);
    expect(created.body.features).toHaveLength(2);
    // Only one featured package at a time
    const after = await admin.get('/api/v1/admin/packages').expect(200);
    expect(after.body.packages.filter((p: { featured: boolean }) => p.featured)).toHaveLength(1);

    await admin
      .patch(`/api/v1/admin/packages/${created.body.id}`)
      .send({ features: [{ comparisonRowId: row.id, label: row.label, availability: 'CUSTOM' }] })
      .expect(400);
    await admin.patch(`/api/v1/admin/packages/${created.body.id}`).send({ active: false }).expect(200);
    const pub = await server().get('/api/v1/packages').expect(200);
    expect(pub.body.packages.find((p: { name: string }) => p.name === 'Platinum')).toBeUndefined();
    await admin.delete(`/api/v1/admin/packages/${created.body.id}`).expect(204);
  });

  it('uploads images and manages projects, testimonials and FAQs', async () => {
    const upload = await admin.post('/api/v1/admin/uploads/image?folder=projects').attach('file', TINY_PNG, { filename: 'p.png', contentType: 'image/png' }).expect(201);
    expect(upload.body.key).toMatch(/^public\/projects\//);
    await server().get(`/uploads/${upload.body.key}`).expect(200).expect('Content-Type', /image\/png/);

    await admin.post('/api/v1/admin/uploads/image').attach('file', Buffer.from('<?php echo 1; ?>'), { filename: 'x.png', contentType: 'image/png' }).expect(400);
    await admin.post('/api/v1/admin/uploads/image').attach('file', Buffer.from('MZ....'), { filename: 'x.exe', contentType: 'application/octet-stream' }).expect(400);

    const project = await admin
      .post('/api/v1/admin/projects')
      .send({ title: 'Office Fit-out', description: '<p>Done</p>', status: 'PUBLISHED', images: [{ url: upload.body.url, key: upload.body.key, alt: 'Office' }] })
      .expect(201);
    await server().get(`/api/v1/projects/${project.body.slug}`).expect(200);
    await admin.delete(`/api/v1/admin/projects/${project.body.id}`).expect(204);

    const t = await admin.post('/api/v1/admin/testimonials').send({ name: 'Real Customer', rating: 5, review: 'Great work', status: 'PUBLISHED' }).expect(201);
    await admin.post('/api/v1/admin/testimonials').send({ name: 'X', rating: 9, review: 'bad' }).expect(400);
    const list = await server().get('/api/v1/testimonials').expect(200);
    expect(list.body.map((x: { id: string }) => x.id)).toContain(t.body.id);

    const faq = await admin.post('/api/v1/admin/faqs').send({ question: 'Do you clean water tanks?', answer: 'Yes.' }).expect(201);
    await admin.patch(`/api/v1/admin/faqs/${faq.body.id}`).send({ status: 'DRAFT' }).expect(200);
    await admin.delete(`/api/v1/admin/faqs/${faq.body.id}`).expect(204);
  });

  it('updates centralised settings and validates them', async () => {
    await admin.patch('/api/v1/admin/settings').send({ whatsappNumber: '+971 50 999 8888', facebookUrl: 'https://facebook.com/hikeup' }).expect(200);
    await admin.patch('/api/v1/admin/settings').send({ facebookUrl: 'not-a-url' }).expect(400);
    await admin.patch('/api/v1/admin/settings').send({ unknownKey: 'x' }).expect(400);
    const s = await server().get('/api/v1/settings').expect(200);
    expect(s.body.whatsappNumber).toBe('+971 50 999 8888');
  });

  it('edits about content and legal pages', async () => {
    await admin.patch('/api/v1/admin/content/about.mission').send({ title: 'Our Mission', body: '<p>Keep homes running.</p><img src=x onerror=alert(1)>' }).expect(200);
    const content = await server().get('/api/v1/content?prefix=about.').expect(200);
    expect(content.body['about.mission'].body).toBe('<p>Keep homes running.</p>');
    const pages = await admin.get('/api/v1/admin/legal').expect(200);
    await admin.patch(`/api/v1/admin/legal/${pages.body[0].id}`).send({ content: '<h2>Updated</h2>' }).expect(200);
  });
});
