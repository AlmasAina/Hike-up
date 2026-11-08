# HIKE UP General Maintenance — Website & Management Platform

Production-ready website, customer portal and admin dashboard for **HIKE UP General Maintenance**,
an Abu Dhabi general and building maintenance company.

| Part | Technology | Location |
| --- | --- | --- |
| Public website, customer portal, admin panel | Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Radix UI (shadcn-style), Motion, TanStack Query, React Hook Form + Zod | `apps/web` |
| REST API | NestJS 11, JWT + rotating refresh tokens, RBAC, Swagger, Helmet, rate limiting | `apps/api` |
| Database | PostgreSQL 16, Prisma 6 ORM, SQL migrations with PL/pgSQL functions | `database` |
| Shared code | Domain types/enums, brand tokens, WhatsApp/tel link helpers | `packages/*` |
| Containers & cloud | Docker, Docker Compose, AWS (ECS Fargate, RDS, S3, CloudFront, SES, Route 53, ACM) | `docker`, `infra/aws` |

> **Business rules built in:** there is **no online booking and no online payment**. Customers submit
> quote, service and contact requests; the team contacts them manually. WhatsApp buttons open a
> `wa.me` chat — conversations are not synchronised into the system.

---

## Contents

- [Features](#features)
- [Requirements](#requirements)
- [Quick start (local development)](#quick-start-local-development)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Testing](#testing)
- [Build & production](#build--production)
- [AWS deployment](#aws-deployment)
- [Content that must be reviewed before launch](#content-that-must-be-reviewed-before-launch)
- [Further documentation](#further-documentation)

## Features

**Public website** — Home, About, Services (+ detail pages), Packages with responsive comparison
table, Projects (gallery + lightbox + category filter), Testimonials, FAQ, Contact, Get a Quote,
Privacy / Terms / Cancellation pages, 404/500/401/403 pages. Sticky header, mobile drawer, floating
WhatsApp and Call buttons, scroll animations that respect `prefers-reduced-motion`, SEO metadata,
canonical URLs, Open Graph, `sitemap.xml`, `robots.txt`, LocalBusiness / Service / FAQ / Breadcrumb
structured data and optional Google Analytics 4.

**Quote requests** — validated form with up to 6 photos (JPEG/PNG/WEBP, 5 MB each, magic-byte
checked), upload progress, honeypot spam trap, reference numbers (`HU-2026-000123`), email to the
team + confirmation email to the customer, dashboard notification for admins.

**Customer portal** (`/customer/*`) — registration, login, email verification, forgot/reset
password, dashboard (totals / pending / in progress / completed), request history with status
timeline, add more photos, message the team per request, notifications, profile & avatar, password
change.

**Admin panel** (`/admin/*`) — dashboard with KPIs and charts; quote request management (search,
filter by status/service/type/date, status workflow `NEW → CONTACTED → IN_PROGRESS → QUOTED →
APPROVED/REJECTED → COMPLETED`, internal notes, assign technicians, reply to customers, one-click
Call / WhatsApp / Email); CRUD for services (rich text, gallery, icon, SEO, order, publish),
packages (unlimited, features, comparison matrix, colour, badge, featured, optional pricing),
projects, testimonials, FAQs, page content (About + homepage sections), legal pages, technicians
(skills, restricted STAFF logins), customers (enable/disable, send reset link — passwords never
shown), contact messages, site settings (company, phone, WhatsApp, email, location, hours, social
links, footer, CTA, SEO, analytics, logo, favicon), admin users and audit logs.

**Roles** — `SUPER_ADMIN` (everything), `ADMIN` (content, requests, customers, technicians,
settings), `STAFF` (only requests assigned to them), `CUSTOMER` (own requests only).

## Requirements

- Node.js **22.12+** (see `.nvmrc`) and npm 10+
- PostgreSQL **16** (local install or Docker)
- Docker + Docker Compose v2 (optional, for the container stack)

## Quick start (local development)

```bash
# 1. Install Node.js 22 (e.g. `nvm install && nvm use`)

# 2. Install dependencies (npm workspaces)
npm install

# 3. Configure environment
cp .env.example .env
#    - set POSTGRES_PASSWORD and the matching DATABASE_URL / DATABASE_URL_TEST
#    - set JWT_SECRET and JWT_REFRESH_SECRET:  openssl rand -base64 48
#    - set SEED_ADMIN_EMAIL (+ optionally SEED_ADMIN_PASSWORD)

# 4. Start PostgreSQL + Mailpit (email inbox at http://localhost:8025)
docker compose up -d postgres mailpit

# 5. Generate the Prisma client and run migrations
npm run build:packages
npm run db:generate
npm run db:migrate          # prisma migrate deploy

# 6. Seed roles, admin user, services, packages, FAQs, content, settings, legal pages
npm run db:seed

# 7 + 8. Start API and website together (or `npm run dev:api` / `npm run dev:web`)
npm run dev
```

9. Open:

| URL | What |
| --- | --- |
| http://localhost:3000 | Website |
| http://localhost:3000/admin | Admin panel (seeded `SEED_ADMIN_EMAIL`) |
| http://localhost:3000/customer/dashboard | Customer portal |
| http://localhost:4000/api/v1 | REST API |
| http://localhost:4000/api/docs | Swagger / OpenAPI |
| http://localhost:8025 | Mailpit (when `MAIL_TRANSPORT=smtp`, `SMTP_HOST=localhost`, `SMTP_PORT=1025`) |

Prefer everything in containers? `docker compose up -d --build`, then seed once with
`docker compose exec api sh -c "cd /app/database && npx tsx seed/seed.ts"`.
Full details: [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md).

## Environment variables

All variables are documented inline in [`.env.example`](.env.example). The most important ones:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Access-token signing key and refresh-token HMAC key (≥ 32 chars each) |
| `WEB_URL`, `NEXT_PUBLIC_SITE_URL` | Public website origin (emails, CORS/CSRF, canonical URLs) |
| `API_INTERNAL_URL` | How the Next.js server reaches the API (also the `/api/v1` proxy target) |
| `NEXT_PUBLIC_API_URL` | Browser API base (default `/api/v1`, same-origin via the proxy) |
| `COOKIE_SECURE`, `COOKIE_DOMAIN` | Session cookie flags (`COOKIE_SECURE=true` is enforced in production) |
| `STORAGE_DRIVER` (`local`/`s3`), `UPLOAD_DIR`, `STORAGE_PUBLIC_BASE_URL`, `AWS_S3_BUCKET`, `AWS_REGION` | File storage |
| `MAIL_TRANSPORT` (`log`/`smtp`/`ses`), `SMTP_*`, `MAIL_FROM`, `MAIL_TO`, `AWS_SES_REGION` | Email |
| `COMPANY_*`, `WHATSAPP_NUMBER`, `FACEBOOK_URL`, `INSTAGRAM_URL`, `LINKEDIN_URL` | **Seed defaults only** — afterwards everything is edited in Admin → Site Settings |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | First super admin (a random password is generated and printed once if empty) |
| `SEED_DEMO_USERS`, `SEED_PUBLISH_SAMPLE_CONTENT` | Local-development helpers — keep `false` in production |

The API validates its configuration at start-up (`apps/api/src/config/env.ts`) and refuses to boot
with missing or weak values.

## Database

- Schema: [`database/schema.prisma`](database/schema.prisma) — 30 tables, UUID keys, timestamps,
  soft deletes, foreign keys and indexes.
- Migrations: [`database/migrations`](database/migrations) — plain SQL, including PL/pgSQL
  functions (`generate_quote_reference`, `customer_request_stats`, `quote_requests_by_month`,
  `quote_requests_by_service`, `customer_growth_by_month`) and the `purge_expired_tokens` procedure.
- Seed: [`database/seed`](database/seed) — idempotent; never overwrites edited content.

| Command | Description |
| --- | --- |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Apply pending migrations (`prisma migrate deploy`, safe for production) |
| `npm run db:migrate:dev -- --name <change>` | Create a new migration in development |
| `npm run db:seed` | Seed / top-up base data |
| `npm run studio -w @hikeup/database` | Prisma Studio |

**Why Prisma 6?** PostgreSQL was chosen, and Prisma gives type-safe queries, readable SQL migration
files and first-class PostgreSQL support. Version 6 is used because its CommonJS client works
natively with NestJS 11; Prisma 7 needs driver adapters and an ESM-first client (see
[docs/DATABASE.md](docs/DATABASE.md#upgrading-prisma)). Raw SQL functions are called through
`$queryRaw` where set-based reporting is clearer in SQL.

## Testing

| Command | What runs |
| --- | --- |
| `npm test` | Unit tests: shared helpers (node:test), API (Jest) and web (Vitest) |
| `npm run test:api:e2e` | API integration tests (Supertest) against `DATABASE_URL_TEST` — the database name must end in `_test`; it is migrated, emptied and re-seeded on every run |
| `npm run test:e2e` | Playwright end-to-end tests against a running stack (`E2E_BASE_URL`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`) |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript strict checks |

Coverage includes registration/login/logout, refresh-token rotation and reuse detection, password
reset, RBAC (customer/staff/admin/super admin), services/packages/projects/testimonials/FAQ CRUD,
uploads (valid and malicious files), quote submission with images, private image access, status
workflow and notifications, messaging, contact form, settings, WhatsApp/tel link generation,
responsive mobile navigation and no horizontal scrolling. CI runs everything in
`.github/workflows/ci.yml`.

## Build & production

```bash
npm run build                       # shared packages, Prisma client, API and web
npm run start -w @hikeup/api        # node apps/api/dist/main.js
npm run start -w @hikeup/web        # next start
```

Container images:

```bash
docker build -f docker/api/Dockerfile -t hikeup-api .
docker build -f docker/web/Dockerfile --build-arg API_INTERNAL_URL=http://api:4000 \
  --build-arg NEXT_PUBLIC_SITE_URL=https://www.example.com -t hikeup-web .
```

The API image applies migrations on start (`RUN_MIGRATIONS=true`, default) and exposes a health
check at `/api/v1/health`.

## AWS deployment

Route 53 → CloudFront → ALB → ECS Fargate (`web`, `api`) → RDS PostgreSQL (private), with uploads
in a private S3 bucket served through CloudFront, email via SES, TLS from ACM and secrets in AWS
Secrets Manager. Step-by-step guide: [docs/AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md); templates in
[`infra/aws`](infra/aws); manual deploy workflow in `.github/workflows/deploy-aws.yml`.

## Content that must be reviewed before launch

- **Testimonials** are clearly marked *sample* (`isSample`) and stay **draft** unless
  `SEED_PUBLISH_SAMPLE_CONTENT=true`; the site labels them "Sample review". Replace them with
  genuine reviews.
- **Projects** are *demo* placeholders (`isDemo`, labelled "Demo content", not indexed). Replace
  them with real projects and photos.
- **Service images** are original SVG illustrations (`apps/web/scripts/generate-illustrations.mjs`).
  Upload real photos in Admin → Services when available.
- **Legal pages** are generic templates — have them reviewed by a qualified UAE adviser.
- **Package pricing** is intentionally empty ("Pricing on request"). The figures on the supplied
  artwork (`docs/reference/packages-artwork.jpg`) can be entered in Admin → Packages.
- **Company details** come from the supplied marketing material and economic licence: trade name
  *HIKE UP GENERAL MAINTENANCE - L.L.C - S.P.C*, Abu Dhabi licence *CN-6691609* (activity: Buildings
  Maintenance), phone/WhatsApp *+971 54 788 4035*, email *hikeupgm@gmail.com*. The owner's personal
  details and the licence's personal contact details are deliberately **not** used. Social media
  URLs are empty until real profiles exist. No certifications, awards, years of experience or client
  counts are claimed.

## Further documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — architecture, request flow, folder structure
- [docs/API.md](docs/API.md) — endpoints, auth, errors
- [docs/DATABASE.md](docs/DATABASE.md) — ERD, tables, functions, migrations, backups
- [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md) — detailed local setup and troubleshooting
- [docs/AWS_EC2_DEPLOYMENT.md](docs/AWS_EC2_DEPLOYMENT.md) — step-by-step single-server AWS deployment (EC2 + Docker + HTTPS)
- [docs/AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md) — AWS architecture, deployment, backup & restore
- [docs/SECURITY.md](docs/SECURITY.md) — security controls and operational checklist
