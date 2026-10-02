/**
 * Idempotent seed for HIKE UP.
 *
 *   npm run db:seed
 *
 * - Never overwrites content that already exists (safe to run after admins have edited content).
 * - Admin credentials come from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD. If no password is given a
 *   strong random password is generated and printed ONCE.
 * - Demo users (customer + staff) are only created when SEED_DEMO_USERS=true and are flagged isDemo.
 * - Sample testimonials / demo projects are flagged (isSample / isDemo) and stay DRAFT unless
 *   SEED_PUBLISH_SAMPLE_CONTENT=true (useful for local development only).
 */
import path from 'node:path';
import { config } from 'dotenv';
import { randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import { PrismaClient, type RoleName } from '@prisma/client';
import { services } from './data/services';
import { comparisonRows, packages } from './data/packages';
import { faqs } from './data/faqs';
import { sampleTestimonials } from './data/testimonials';
import { demoProjects } from './data/projects';
import { contentSections } from './data/content';
import { legalPages } from './data/legal';
import { settingsDefaults } from './data/settings';

config({ path: [path.join(__dirname, '..', '.env'), path.join(__dirname, '..', '..', '.env')], quiet: true });

const prisma = new PrismaClient();
const flag = (key: string) => (process.env[key] ?? '').toLowerCase() === 'true';
const log = (message: string) => console.log(`  • ${message}`);

const hashPassword = (password: string) =>
  argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });

async function seedRoles() {
  const roles: { name: RoleName; description: string }[] = [
    { name: 'SUPER_ADMIN', description: 'Full access including admin users, settings and audit logs' },
    { name: 'ADMIN', description: 'Manage content, requests, customers and technicians' },
    { name: 'STAFF', description: 'Technicians/staff — view and update assigned requests only' },
    { name: 'CUSTOMER', description: 'Website customer account' },
  ];
  for (const role of roles) {
    await prisma.role.upsert({ where: { name: role.name }, update: {}, create: role });
  }
  log('roles');
}

async function ensureUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: RoleName;
  phone?: string;
  isDemo?: boolean;
}) {
  const email = input.email.toLowerCase();
  const role = await prisma.role.findUniqueOrThrow({ where: { name: input.role } });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: existing.id, roleId: role.id } },
      update: {},
      create: { userId: existing.id, roleId: role.id },
    });
    return { user: existing, created: false };
  }
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(input.password),
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone ?? null,
      emailVerifiedAt: new Date(),
      isDemo: input.isDemo ?? false,
      roles: { create: { roleId: role.id } },
    },
  });
  return { user, created: true };
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  if (!email) {
    log('SEED_ADMIN_EMAIL not set — skipping super admin');
    return;
  }
  let password = process.env.SEED_ADMIN_PASSWORD?.trim() ?? '';
  const generated = !password;
  if (generated) password = randomBytes(18).toString('base64url');
  if (password.length < 12) throw new Error('SEED_ADMIN_PASSWORD must be at least 12 characters');

  const { created } = await ensureUser({
    email,
    password,
    firstName: process.env.SEED_ADMIN_FIRST_NAME?.trim() || 'Site',
    lastName: process.env.SEED_ADMIN_LAST_NAME?.trim() || 'Administrator',
    role: 'SUPER_ADMIN',
  });
  if (created && generated) {
    console.log(`\n  ⚠  Super admin created: ${email}\n     Generated password (shown once): ${password}\n`);
  } else {
    log(created ? `super admin ${email}` : `super admin ${email} already exists (unchanged)`);
  }
}

async function seedDemoUsers() {
  if (!flag('SEED_DEMO_USERS')) return;
  const password = process.env.SEED_DEMO_PASSWORD?.trim();
  if (!password || password.length < 8) {
    log('SEED_DEMO_USERS=true but SEED_DEMO_PASSWORD missing/short — skipping demo users');
    return;
  }
  await ensureUser({
    email: 'demo.customer@example.com',
    password,
    firstName: 'Demo',
    lastName: 'Customer',
    role: 'CUSTOMER',
    phone: '+971500000000',
    isDemo: true,
  });
  const { user: staff } = await ensureUser({
    email: 'demo.staff@example.com',
    password,
    firstName: 'Demo',
    lastName: 'Technician',
    role: 'STAFF',
    isDemo: true,
  });
  const technician = await prisma.technician.findUnique({ where: { userId: staff.id } });
  if (!technician) {
    await prisma.technician.create({
      data: {
        userId: staff.id,
        name: 'Demo Technician',
        email: staff.email,
        role: 'Maintenance Technician (demo)',
        skills: ['Electrical', 'Plumbing', 'AC'],
      },
    });
  }
  log('demo customer + demo staff (flagged isDemo)');
}

async function seedServices() {
  let created = 0;
  for (const [index, service] of services.entries()) {
    const exists = await prisma.service.findUnique({ where: { slug: service.slug } });
    if (exists) continue;
    const image = `/images/services/${service.slug}.svg`;
    await prisma.service.create({
      data: {
        slug: service.slug,
        title: service.title,
        icon: service.icon,
        featured: service.featured,
        shortDescription: service.shortDescription,
        introduction: service.introduction,
        description: service.description,
        seoTitle: service.seoTitle,
        seoDescription: service.seoDescription,
        imageUrl: image,
        ogImageUrl: null,
        status: 'PUBLISHED',
        sortOrder: index,
        images: { create: [{ url: image, alt: service.title, sortOrder: 0 }] },
        features: {
          create: [
            ...service.coverage.map((title, i) => ({ type: 'COVERAGE' as const, title, sortOrder: i })),
            ...service.benefits.map((b, i) => ({ type: 'BENEFIT' as const, ...b, sortOrder: i })),
            ...service.process.map((p, i) => ({ type: 'PROCESS_STEP' as const, ...p, sortOrder: i })),
          ],
        },
        faqs: { create: service.faqs.map((f, i) => ({ ...f, sortOrder: i })) },
      },
    });
    created++;
  }
  log(`services (${created} created)`);
}

async function seedPackages() {
  const rowCount = await prisma.packageComparisonRow.count();
  const rowIds = new Map<string, string>();
  if (rowCount === 0) {
    for (const [i, row] of comparisonRows.entries()) {
      const r = await prisma.packageComparisonRow.create({
        data: { label: row.label, icon: row.icon, sortOrder: i },
      });
      rowIds.set(row.key, r.id);
    }
  }
  let created = 0;
  for (const [i, pkg] of packages.entries()) {
    const exists = await prisma.package.findUnique({ where: { slug: pkg.slug } });
    if (exists) continue;
    const { key, extraFeatures, ...data } = pkg;
    await prisma.package.create({
      data: {
        ...data,
        sortOrder: i,
        active: true,
        features: {
          create: [
            ...extraFeatures.map((label, j) => ({
              label,
              availability: 'INCLUDED' as const,
              showOnCard: true,
              sortOrder: j,
            })),
            ...comparisonRows
              .filter((row) => rowIds.has(row.key))
              .map((row, j) => ({
                comparisonRowId: rowIds.get(row.key)!,
                label: row.label,
                availability: row.values[key].availability,
                value: row.values[key].value ?? null,
                showOnCard: row.values[key].availability !== 'NOT_INCLUDED',
                sortOrder: extraFeatures.length + j,
              })),
          ],
        },
      },
    });
    created++;
  }
  log(`packages (${created} created)`);
}

async function seedFaqs() {
  if ((await prisma.faq.count()) > 0) return log('faqs (existing, skipped)');
  await prisma.faq.createMany({
    data: faqs.map((f, i) => ({ ...f, status: 'PUBLISHED' as const, sortOrder: i })),
  });
  log(`faqs (${faqs.length} created)`);
}

async function seedTestimonials() {
  if ((await prisma.testimonial.count()) > 0) return log('testimonials (existing, skipped)');
  const status = flag('SEED_PUBLISH_SAMPLE_CONTENT') ? 'PUBLISHED' : 'DRAFT';
  await prisma.testimonial.createMany({
    data: sampleTestimonials.map((t, i) => ({ ...t, isSample: true, status, sortOrder: i })),
  });
  log(`sample testimonials (${sampleTestimonials.length}, status ${status}, isSample=true)`);
}

async function seedProjects() {
  const status = flag('SEED_PUBLISH_SAMPLE_CONTENT') ? 'PUBLISHED' : 'DRAFT';
  let created = 0;
  for (const [i, project] of demoProjects.entries()) {
    if (await prisma.project.findUnique({ where: { slug: project.slug } })) continue;
    const service = await prisma.service.findUnique({ where: { slug: project.serviceSlug } });
    await prisma.project.create({
      data: {
        slug: project.slug,
        title: project.title,
        location: project.location,
        summary: project.summary,
        description: project.description,
        serviceId: service?.id ?? null,
        isDemo: true,
        status,
        sortOrder: i,
        images: { create: [{ url: project.image, alt: project.title, sortOrder: 0 }] },
      },
    });
    created++;
  }
  log(`demo projects (${created} created, status ${status}, isDemo=true)`);
}

async function seedContent() {
  let created = 0;
  for (const section of contentSections) {
    if (await prisma.contentSection.findUnique({ where: { key: section.key } })) continue;
    await prisma.contentSection.create({
      data: {
        key: section.key,
        title: section.title ?? null,
        subtitle: section.subtitle ?? null,
        body: section.body ?? null,
        items: section.items ?? [],
      },
    });
    created++;
  }
  log(`content sections (${created} created)`);
}

async function seedSettings() {
  let created = 0;
  for (const setting of settingsDefaults()) {
    if (await prisma.siteSetting.findUnique({ where: { key: setting.key } })) continue;
    await prisma.siteSetting.create({ data: setting });
    created++;
  }
  log(`settings (${created} created)`);
}

async function seedLegal() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ['companyLegalName', 'email'] } },
  });
  const get = (key: string) => settings.find((s) => s.key === key)?.value ?? '';
  let created = 0;
  for (const page of legalPages(get('companyLegalName') || 'HIKE UP General Maintenance', get('email') || 'our email address')) {
    if (await prisma.legalPage.findUnique({ where: { slug: page.slug } })) continue;
    await prisma.legalPage.create({ data: { ...page, published: true } });
    created++;
  }
  log(`legal pages (${created} created)`);
}

async function main() {
  console.log('Seeding HIKE UP database…');
  await seedRoles();
  await seedAdmin();
  await seedDemoUsers();
  await seedSettings();
  await seedServices();
  await seedPackages();
  await seedFaqs();
  await seedTestimonials();
  await seedProjects();
  await seedContent();
  await seedLegal();
  console.log('Done.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
