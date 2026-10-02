import { describe, expect, it } from 'vitest';
import { isSvg, safeRedirect } from '@/lib/utils';
import { quoteRequestSchema, registerSchema } from '@/schemas/forms';

describe('safeRedirect', () => {
  it('allows same-site relative paths', () => expect(safeRedirect('/customer/requests', '/')).toBe('/customer/requests'));
  it('blocks open redirects', () => {
    expect(safeRedirect('https://evil.example', '/x')).toBe('/x');
    expect(safeRedirect('//evil.example', '/x')).toBe('/x');
    expect(safeRedirect('/\\evil.example', '/x')).toBe('/x');
    expect(safeRedirect(null, '/x')).toBe('/x');
  });
});

describe('isSvg', () => {
  it('detects SVG paths', () => {
    expect(isSvg('/images/services/a.svg')).toBe(true);
    expect(isSvg('https://cdn/x.webp')).toBe(false);
  });
});

describe('form schemas', () => {
  const valid = {
    firstName: 'A',
    lastName: 'B',
    email: 'a@b.com',
    phone: '+971 50 123 4567',
    location: 'Abu Dhabi',
    propertyType: 'VILLA',
    preferredContact: 'WHATSAPP',
    description: 'AC is not cooling at all',
  };
  it('accepts a valid quote request', () => expect(quoteRequestSchema.safeParse(valid).success).toBe(true));
  it('requires a meaningful description', () => expect(quoteRequestSchema.safeParse({ ...valid, description: 'help' }).success).toBe(false));
  it('rejects the honeypot', () => expect(quoteRequestSchema.safeParse({ ...valid, website: 'spam' }).success).toBe(false));
  it('enforces matching passwords and terms acceptance', () => {
    const base = { firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '0501234567', password: 'Password1', confirmPassword: 'Password1', acceptTerms: true };
    expect(registerSchema.safeParse(base).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, confirmPassword: 'Other1234' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: 'letters', confirmPassword: 'letters' }).success).toBe(false);
  });
});
