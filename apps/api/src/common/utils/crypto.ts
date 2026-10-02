import { createHash, createHmac, randomBytes } from 'node:crypto';

/** Cryptographically random URL-safe token. */
export function generateToken(bytes = 48): string {
  return randomBytes(bytes).toString('base64url');
}

/** Keyed SHA-256 so a database leak alone is not enough to use stored tokens. */
export function hmacToken(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token).digest('hex');
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
