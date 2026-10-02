import { execSync } from 'node:child_process';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { TEST_ENV } from './test-env';

/**
 * Prepares the dedicated integration-test database:
 *  1. `prisma migrate deploy` (non-destructive) applies any pending migrations
 *  2. all rows from previous test runs are truncated (test database only)
 *  3. the real seed script runs
 * The database name MUST end in "_test" — this never runs against development or production data.
 */
export default async function globalSetup(): Promise<void> {
  const dbName = new URL(TEST_ENV.DATABASE_URL).pathname.replace(/^\//, '');
  if (!dbName.endsWith('_test')) {
    throw new Error(`Refusing to prepare "${dbName}": the test database name must end with "_test"`);
  }
  const cwd = path.resolve(__dirname, '../../../database');
  const env = { ...process.env, ...TEST_ENV };
  execSync('npx prisma migrate deploy', { cwd, env, stdio: 'pipe' });

  const prisma = new PrismaClient({ datasources: { db: { url: TEST_ENV.DATABASE_URL } } });
  try {
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
    if (tables.length) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables.map((t) => `"${t.tablename}"`).join(', ')} RESTART IDENTITY CASCADE`);
    }
  } finally {
    await prisma.$disconnect();
  }
  execSync('npx tsx seed/seed.ts', { cwd, env, stdio: 'pipe' });
}
