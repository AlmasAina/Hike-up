/** Public (browser-safe) configuration. */
export const publicEnv = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  apiBase: (process.env.NEXT_PUBLIC_API_URL ?? '/api/v1').replace(/\/$/, ''),
};

/** Server-only: where the Next.js server reaches the NestJS API. */
export function apiInternalBase(): string {
  return `${(process.env.API_INTERNAL_URL ?? 'http://localhost:4000').replace(/\/$/, '')}/api/v1`;
}
