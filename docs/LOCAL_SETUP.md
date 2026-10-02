# Local setup

## 1. Prerequisites

- Node.js 22.12+ (`nvm install && nvm use` reads `.nvmrc`)
- npm 10+
- Docker Desktop / Docker Engine with Compose v2 — *or* a local PostgreSQL 16

## 2. Install dependencies

```bash
npm install
```

npm workspaces install `apps/*`, `packages/*` and `database` in one go.

## 3. Configure the environment

```bash
cp .env.example .env
openssl rand -base64 48   # paste into JWT_SECRET
openssl rand -base64 48   # paste into JWT_REFRESH_SECRET
```

Edit `.env`:

- `POSTGRES_PASSWORD` and the same password in `DATABASE_URL` and `DATABASE_URL_TEST`
- `SEED_ADMIN_EMAIL` (and `SEED_ADMIN_PASSWORD`, or leave empty to get a generated one)
- optional for local testing: `SEED_DEMO_USERS=true`, `SEED_DEMO_PASSWORD=…`,
  `SEED_PUBLISH_SAMPLE_CONTENT=true` (publishes clearly labelled sample reviews/demo projects)
- email: keep `MAIL_TRANSPORT=log` (emails printed in the API console) or use Mailpit:
  `MAIL_TRANSPORT=smtp`, `SMTP_HOST=localhost`, `SMTP_PORT=1025`

The API reads the root `.env`; the web app loads it via `next.config.ts`; Prisma via
`database/prisma.config.ts`.

## 4. Start the database

```bash
docker compose up -d postgres mailpit
```

This also creates `hikeup_test` for integration tests (`docker/postgres/init.sql`). With a local
PostgreSQL instead:

```sql
CREATE USER hikeup WITH PASSWORD 'your-password' CREATEDB;
CREATE DATABASE hikeup OWNER hikeup;
CREATE DATABASE hikeup_test OWNER hikeup;
```

## 5. Run migrations

```bash
npm run build:packages   # shared TypeScript packages
npm run db:generate      # Prisma client
npm run db:migrate       # prisma migrate deploy
```

## 6. Seed

```bash
npm run db:seed
```

## 7–8. Start backend and frontend

```bash
npm run dev            # both (concurrently)
# or separately
npm run dev:api        # http://localhost:4000  (watch mode)
npm run dev:web        # http://localhost:3000
```

## 9. Open the browser

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin/login
- Customer portal: register at http://localhost:3000/auth/register
- Swagger: http://localhost:4000/api/docs
- Mailpit: http://localhost:8025

## Full Docker stack

```bash
docker compose up -d --build
docker compose exec api sh -c "cd /app/database && npx tsx seed/seed.ts"
docker compose logs -f api web
```

If Docker Hub rate-limits image pulls, build with the AWS mirror:
`docker compose build --build-arg NODE_IMAGE=public.ecr.aws/docker/library/node:22.12-bookworm-slim`.

## Tests

```bash
npm test                 # unit tests (ui helpers, API, web)
npm run test:api:e2e     # API integration tests — uses DATABASE_URL_TEST (name must end in _test; it is wiped)
npm run test:e2e         # Playwright — needs the stack running and E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD
npx playwright install chromium   # first run only (in apps/web)
```

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run lint` / `npm run typecheck` | Static checks |
| `npm run db:migrate:dev -- --name <change>` | Create a migration after editing `schema.prisma` |
| `npm run studio -w @hikeup/database` | Browse data in Prisma Studio |
| `node apps/web/scripts/generate-illustrations.mjs` | Regenerate the SVG service illustrations |

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| API exits with "Invalid environment configuration" | A required variable is missing or too short — the message lists which. |
| `Cannot find module '@hikeup/types'` | Run `npm run build:packages`. |
| `@prisma/client did not initialize yet` | Run `npm run db:generate`. |
| Public pages show "being updated" placeholders | The API was not reachable when the page rendered; start the API — pages refresh within 60 s. |
| Login works but you are redirected back to login | Cookies are `Secure` — keep `COOKIE_SECURE=false` on plain `http://localhost`. |
| Uploaded images don't show | `STORAGE_PUBLIC_BASE_URL` must be reachable from the browser (default `http://localhost:3000/uploads`). |
