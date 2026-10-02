# Database

PostgreSQL 16 · Prisma 6 · schema: `database/schema.prisma` · migrations: `database/migrations`.

Conventions: UUID primary keys (`gen_random_uuid()`), `snake_case` tables/columns, `created_at` /
`updated_at` on mutable tables, `deleted_at` soft deletes on business content, foreign keys with
explicit `ON DELETE` behaviour, and indexes on email, phone, slug, status and created_at.

## Entity relationship overview

```
roles ─< user_roles >─ users ─┬─< refresh_tokens / password_reset_tokens / email_verification_tokens
                              ├─< quote_requests (customer) ─┬─< quote_request_images
                              │                              ├─< quote_status_history
                              │                              ├─< request_notes (internal)
                              │                              ├─< request_messages (customer ⇄ team)
                              │                              └─< request_assignments >─ technicians ─ users (STAFF login, optional)
                              ├─< notifications
                              └─< audit_logs
services ─┬─< service_images / service_features (BENEFIT | COVERAGE | PROCESS_STEP) / service_faqs
          ├─< projects ─< project_images
          └─< quote_requests
packages ─< package_features >─ package_comparison_rows
testimonials · faqs · content_sections · site_settings · legal_pages · contact_messages
```

| Table | Notes |
| --- | --- |
| `users`, `roles`, `user_roles` | Many-to-many roles: SUPER_ADMIN, ADMIN, STAFF, CUSTOMER. Passwords stored as Argon2id hashes only. `is_demo` flags seeded demo users. |
| `refresh_tokens` | HMAC-SHA256 hashes, `family_id` for rotation / reuse detection, expiry, revocation. |
| `password_reset_tokens`, `email_verification_tokens` | SHA-256 hashed one-time tokens with expiry. |
| `services` (+ images, features, faqs) | Unique slug, publish status, sort order, SEO fields, soft delete (slug is archived so it can be reused). |
| `packages`, `package_features`, `package_comparison_rows` | Unlimited packages; a feature either belongs to a comparison row (✓ / ✕ / custom text) or is a card-only bullet. `price_label` is optional — pricing is never hard-coded. |
| `projects`, `project_images` | Optional service category; `is_demo` marks placeholder content. |
| `testimonials` | `is_sample` marks placeholder reviews; `CHECK (rating BETWEEN 1 AND 5)`. |
| `faqs`, `content_sections`, `legal_pages`, `site_settings` | CMS content and centralised settings (key/value, `is_public`). |
| `quote_requests` | `reference` default `generate_quote_reference()`, type, status, property type, preferred contact, optional customer & service. |
| `technicians` | Skills (text[]), status, optional link to a STAFF user. |
| `notifications`, `contact_messages`, `audit_logs` | Dashboard notifications, contact form inbox, audit trail (actor, action, entity, ip, metadata). |

## SQL functions & procedures

Defined in `database/migrations/*/migration.sql` and used by the API:

| Object | Used by |
| --- | --- |
| `generate_quote_reference()` + `quote_reference_seq` | Default value of `quote_requests.reference` (`HU-2026-000123`, year in Asia/Dubai) |
| `customer_request_stats(uuid)` | Customer dashboard counters |
| `quote_requests_by_month(int)` | Admin chart (zero-filled months) |
| `quote_requests_by_service(int)` | Admin chart |
| `customer_growth_by_month(int)` | Admin chart |
| `purge_expired_tokens()` (procedure) | Called every 6 h by the API |
| `users_email_lower_key` | Case-insensitive unique email index |

## Migrations

```bash
npm run db:migrate                               # apply pending migrations (deploy-safe)
npm run db:migrate:dev -- --name add_something   # create a new migration (development only)
npm run migrate:status -w @hikeup/database
```

Strategy for production:

1. Every schema change is a reviewed migration committed to git (never `db push` in production).
2. Prefer additive, backwards-compatible migrations (add column → deploy code → backfill → remove
   old column in a later release) so ECS rolling deployments never break running tasks.
3. Run `prisma migrate deploy` once per release before switching traffic (the deploy workflow runs a
   one-off ECS task; the container entrypoint can also do it with `RUN_MIGRATIONS=true`).
4. Take a manual RDS snapshot before risky migrations.

## Seed data

`npm run db:seed` (`database/seed/seed.ts`) is idempotent: it only creates missing rows and never
overwrites content an admin has edited.

| Data | Notes |
| --- | --- |
| Roles, super admin | `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (random password printed once if empty) |
| Demo customer & demo technician | Only with `SEED_DEMO_USERS=true` and `SEED_DEMO_PASSWORD`; flagged `is_demo` |
| 10 services, 3 packages + 8 comparison rows, 10 FAQs | Original copy, editable |
| 3 sample testimonials, 3 demo projects | Flagged; DRAFT unless `SEED_PUBLISH_SAMPLE_CONTENT=true` |
| About/homepage sections, legal pages, site settings | Settings come from `COMPANY_*` env vars |

## Backups & restore

- **RDS automated backups**: enable 7–35 days retention and point-in-time recovery; enable
  deletion protection and copy snapshots to a second region for disaster recovery.
- **Manual snapshots** before major releases: `aws rds create-db-snapshot …`.
- **Logical backups** (optional): `pg_dump --format=custom "$DATABASE_URL" > hikeup.dump`.
- **Restore**: restore the snapshot / PITR to a *new* instance, verify, then switch the
  `DATABASE_URL` secret and redeploy (or `pg_restore --clean --if-exists -d "$DATABASE_URL" hikeup.dump`).
- Uploaded files live in S3 with versioning (see `docs/AWS_DEPLOYMENT.md`).

## Upgrading Prisma

Prisma 7 requires a driver adapter (`@prisma/adapter-pg`), a `prisma.config.ts` datasource URL and an
ESM-first generated client. To upgrade: switch the generator to `prisma-client` with an `output`
directory, construct `PrismaClient({ adapter: new PrismaPg({ connectionString }) })` in
`PrismaService` and the seed, and move `url` out of `schema.prisma`. The SQL migrations are
unaffected.

## Oracle PL/SQL option

Prisma does not support Oracle. If Oracle Database is ever mandated, keep the API's service
classes and replace the data-access layer (`PrismaService`) with TypeORM and its Oracle driver, then
port the functions in `database/migrations` to PL/SQL packages. The relational design (UUID keys,
foreign keys, soft deletes) carries over unchanged.
