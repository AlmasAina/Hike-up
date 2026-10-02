import { validateEnv } from './env';

const base = { DATABASE_URL: 'postgresql://x', JWT_SECRET: 'a'.repeat(32), JWT_REFRESH_SECRET: 'b'.repeat(32) };

describe('validateEnv', () => {
  it('applies defaults', () => {
    const env = validateEnv(base);
    expect(env.PORT).toBe(4000);
    expect(env.STORAGE_DRIVER).toBe('local');
    expect(env.MAIL_TRANSPORT).toBe('log');
  });

  it('rejects short secrets', () => {
    expect(() => validateEnv({ ...base, JWT_SECRET: 'short' })).toThrow('JWT_SECRET');
  });

  it('requires bucket settings for S3', () => {
    expect(() => validateEnv({ ...base, STORAGE_DRIVER: 's3' })).toThrow('AWS_S3_BUCKET');
  });

  it('requires secure cookies in production', () => {
    expect(() => validateEnv({ ...base, NODE_ENV: 'production' })).toThrow('COOKIE_SECURE');
  });
});
