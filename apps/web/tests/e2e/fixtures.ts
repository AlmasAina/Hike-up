import path from 'node:path';

export const ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL ?? 'admin@hikeup.local',
  password: process.env.E2E_ADMIN_PASSWORD ?? 'ChangeMe-Admin-2026',
};

export const SAMPLE_IMAGE = path.resolve(__dirname, '../../public/brand/hikeup-mark.png');

export const unique = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
