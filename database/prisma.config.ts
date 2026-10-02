import path from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// DATABASE_URL is read from the process environment, database/.env or the repository root .env.
config({ path: [path.join(__dirname, '.env'), path.join(__dirname, '..', '.env')], quiet: true });

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),
  migrations: {
    path: path.join(__dirname, 'migrations'),
    seed: 'tsx seed/seed.ts',
  },
});
