# Architecture

## Overview

```
Browser ──HTTPS──▶ Next.js (apps/web)
                     │  • Server Components render public pages (ISR, 60 s + on-demand revalidation)
                     │  • Client components for forms, customer portal and admin panel
                     │  • Rewrites /api/v1/* and /uploads/* to the API (same-origin cookies)
                     ▼
                  NestJS API (apps/api) ──Prisma──▶ PostgreSQL (database/)
                     │                                  └─ PL/pgSQL reporting functions
                     ├─ StorageService ──▶ local disk (dev) │ Amazon S3 (prod)
                     └─ MailService    ──▶ log (dev) │ SMTP │ Amazon SES
```

### Why the API is proxied through the website

The browser only ever talks to the website origin. `next.config.ts` rewrites `/api/v1/*` to
`API_INTERNAL_URL`. As a result:

- session cookies (`hu_at`, `hu_rt`) are first-party, `HttpOnly`, `SameSite=Lax`;
- no CORS pre-flights for the browser;
- the API itself can sit in a private subnet in AWS (only the web tier needs to reach it), while
  Swagger and health checks remain reachable through the load balancer if desired.

Server Components call the API directly through `API_INTERNAL_URL` (`apps/web/lib/server-api.ts`).

## Monorepo layout

```
hike-up/
├── apps/
│   ├── api/                 NestJS REST API
│   │   ├── src/
│   │   │   ├── main.ts / bootstrap.ts / app.module.ts
│   │   │   ├── config/      validated environment (zod) → AppConfig
│   │   │   ├── common/      guards (JWT, roles), decorators, filters, middleware, DTOs, utils
│   │   │   ├── prisma/      PrismaService
│   │   │   ├── auth/        register/login/refresh/logout, password reset, email verification
│   │   │   ├── users/       own profile, admin customers, admin users
│   │   │   ├── services/ packages/ projects/ testimonials/ faqs/ content/ legal/
│   │   │   ├── quote-requests/  public submit, customer portal, back office, private files
│   │   │   ├── contact/ technicians/ notifications/ settings/ uploads/ admin/ health/
│   │   │   ├── storage/     StorageService + local / S3 drivers + image validation
│   │   │   ├── mail/        MailService (log / SMTP / SES) + templates
│   │   │   └── audit/       AuditService + audit log endpoint
│   │   └── test/            Supertest integration tests
│   └── web/                 Next.js 16 App Router
│       ├── app/
│       │   ├── (public)/    marketing site
│       │   ├── (auth)/      /auth/login, /auth/register, /auth/verify-email, /forgot-password, /reset-password
│       │   ├── customer/    customer portal (client shell + pages)
│       │   ├── admin/       /admin/login + (panel)/… admin pages
│       │   ├── actions/     server action: revalidate public pages after admin edits
│       │   ├── sitemap.ts robots.ts not-found.tsx error.tsx global-error.tsx
│       ├── components/      ui/ (design system), layout/, sections/, forms/, packages/,
│       │                    customer/, admin/, shared/, auth/, account/, brand/, motion/
│       ├── hooks/ lib/ schemas/ public/ tests/
│       └── proxy.ts         edge route guard (Next.js 16 "proxy", formerly middleware)
├── packages/
│   ├── types/   shared enums + API response types
│   ├── ui/      brand tokens, wa.me / tel: / mailto: builders, formatting helpers
│   └── config/  shared tsconfig
├── database/    schema.prisma, migrations/, seed/, prisma.config.ts
├── docker/      Dockerfiles, entrypoint, Postgres init
├── infra/aws/   ECS task definitions, IAM / S3 policies
└── docs/
```

## Key design decisions

| Topic | Decision |
| --- | --- |
| Content | Every dynamic item (services, packages, projects, testimonials, FAQs, About/homepage sections, legal pages, contact details, social links, footer, CTA, SEO) lives in PostgreSQL and is editable in the admin panel. Only static UI labels are in code. |
| Contact links | One source of truth: `site_settings`. `packages/ui/src/contact-links.ts` normalises numbers (`054…`, `00971…`, `+971 …`) to `971…` for `https://wa.me/<digits>?text=…` and `tel:+971…`. |
| Caching | Public pages use ISR (60 s). Admin saves call a server action that runs `revalidatePath('/', 'layout')` after verifying the user is a manager. |
| Auth | Short-lived JWT access token (15 min) + opaque rotating refresh token (30 days) stored as an HMAC hash with family-based reuse detection. The JWT guard re-loads the user on every request so disabling a user takes effect immediately. |
| RBAC | `@Roles()` decorator + global `RolesGuard`; `SUPER_ADMIN` implies `ADMIN`. STAFF users are additionally restricted to requests assigned to their technician profile inside the service layer. |
| Files | `StorageService` abstracts local disk and S3. Keys are `public/…` (served statically / via CloudFront) or `private/…` (customer request photos, streamed only after an ownership/assignment check or via short-lived presigned URLs). |
| Rich text | TipTap editor in the admin; the API sanitises HTML with an allow-list before storing it. |
| Animations | `motion` with `LazyMotion` + `MotionConfig reducedMotion="user"`; reveal content is forced visible under `prefers-reduced-motion` and when JavaScript is disabled. |
| Images | Brand logo variants generated from the supplied artwork; original SVG service illustrations (no hot-linked stock photos). |

## Request lifecycle: quote request

1. Visitor submits `/get-a-quote` (multipart) → `POST /api/v1/quote-requests`.
2. API validates the DTO, checks the honeypot, validates each image's magic bytes, stores images
   under `private/quote-requests/…`, creates the request with a `HU-YYYY-NNNNNN` reference
   (`generate_quote_reference()`), status history and an audit entry.
3. Admin notification rows are created and emails go to the team (`notificationEmail`) and to the
   customer.
4. Admin/staff update the status (history + customer notification + email), add internal notes,
   assign technicians and reply. Customers follow everything in `/customer/requests/[id]`.
