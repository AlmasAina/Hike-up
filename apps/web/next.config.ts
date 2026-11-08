import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';
import type { NextConfig } from 'next';

// Load the monorepo root .env for local development (real env vars take precedence). Parsed directly
// because @next/env caches the first load (apps/web) and would silently skip the root file.
const rootEnvFile = path.resolve(__dirname, '../../.env');
if (existsSync(rootEnvFile)) {
  for (const [key, value] of Object.entries(parseEnv(readFileSync(rootEnvFile, 'utf8')))) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

const apiInternalUrl = (process.env.API_INTERNAL_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const isDev = process.env.NODE_ENV !== 'production';

/** Hosts allowed for next/image (site URL, upload CDN, plus IMAGE_REMOTE_HOSTS). */
function remoteImagePatterns() {
  const urls = [process.env.NEXT_PUBLIC_SITE_URL, process.env.STORAGE_PUBLIC_BASE_URL, process.env.API_PUBLIC_URL]
    .concat((process.env.IMAGE_REMOTE_HOSTS ?? '').split(','))
    .map((v) => v?.trim())
    .filter((v): v is string => Boolean(v));
  const patterns = new Map<string, { protocol: 'http' | 'https'; hostname: string; port: string }>();
  for (const value of urls) {
    try {
      const url = new URL(value.includes('://') ? value : `https://${value}`);
      patterns.set(url.host, {
        protocol: url.protocol === 'http:' ? 'http' : 'https',
        hostname: url.hostname,
        port: url.port,
      });
    } catch {
      // ignore malformed entries
    }
  }
  return [...patterns.values()].map((p) => ({ ...p, pathname: '/**' }));
}

/**
 * next/image refuses to fetch from loopback/private addresses. With local file storage the uploads are
 * served from this machine (e.g. http://localhost:3000/uploads), so allow it only in that case.
 */
function uploadsServedLocally() {
  const value = process.env.STORAGE_PUBLIC_BASE_URL ?? process.env.API_PUBLIC_URL ?? '';
  try {
    return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(value).hostname);
  } catch {
    return false;
  }
}

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:" + (isDev ? ' http:' : ''),
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com" +
    (isDev ? ' ws: http://localhost:*' : ''),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['@hikeup/types', '@hikeup/ui'],
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 90],
    remotePatterns: remoteImagePatterns(),
    dangerouslyAllowLocalIP: uploadsServedLocally(),
    minimumCacheTTL: 3600,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'motion'],
  },
  async rewrites() {
    // The browser talks to the API through the website origin, so auth cookies are first-party
    // and no CORS round-trips are needed. Uploaded public files are proxied the same way.
    return [
      { source: '/api/v1/:path*', destination: `${apiInternalUrl}/api/v1/:path*` },
      { source: '/uploads/:path*', destination: `${apiInternalUrl}/uploads/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
        ],
      },
      {
        source: '/(customer|admin|auth)/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
