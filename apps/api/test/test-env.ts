import path from 'node:path';
import os from 'node:os';

/**
 * Environment for API integration tests. Uses a dedicated database (DATABASE_URL_TEST) that is
 * reset on every run — never point this at a real database.
 */
export const TEST_ENV: Record<string, string> = {
  NODE_ENV: 'test',
  DATABASE_URL: process.env.DATABASE_URL_TEST ?? 'postgresql://hikeup:hikeup@localhost:5432/hikeup_test?schema=public',
  JWT_SECRET: 'test-access-secret-test-access-secret-0123',
  JWT_REFRESH_SECRET: 'test-refresh-secret-test-refresh-secret-01',
  WEB_URL: 'http://localhost:3000',
  API_PUBLIC_URL: 'http://localhost:4000',
  STORAGE_DRIVER: 'local',
  UPLOAD_DIR: path.join(os.tmpdir(), 'hikeup-test-uploads'),
  MAIL_TRANSPORT: 'log',
  SWAGGER_ENABLED: 'false',
  COMPANY_PHONE: '+971500000001',
  COMPANY_EMAIL: 'info@example.com',
  SEED_ADMIN_EMAIL: 'admin@test.local',
  SEED_ADMIN_PASSWORD: 'Admin-Password-123',
  SEED_DEMO_USERS: 'true',
  SEED_DEMO_PASSWORD: 'Demo-Password-123',
  SEED_PUBLISH_SAMPLE_CONTENT: 'false',
};
