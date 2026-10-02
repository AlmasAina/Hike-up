import { describe, expect, it } from 'vitest';
import { getContactLinks } from '@/lib/contact';

const settings = { phone: '054 788 4035', whatsappNumber: '', whatsappMessage: 'Hello HIKE UP, I need a quote.', email: 'info@example.com' };

describe('getContactLinks', () => {
  it('builds tel: and wa.me links from centrally configured settings', () => {
    const links = getContactLinks(settings);
    expect(links.phoneHref).toBe('tel:+971547884035');
    expect(links.phoneDisplay).toBe('+971 54 788 4035');
    expect(links.whatsappHref).toBe('https://wa.me/971547884035?text=Hello%20HIKE%20UP%2C%20I%20need%20a%20quote.');
    expect(links.emailHref).toBe('mailto:info@example.com');
  });

  it('prefers the dedicated WhatsApp number and accepts a custom message', () => {
    const links = getContactLinks({ ...settings, whatsappNumber: '+971 50 000 0000' }, 'Plumbing quote please');
    expect(links.whatsappHref).toBe('https://wa.me/971500000000?text=Plumbing%20quote%20please');
  });

  it('returns empty links when nothing is configured', () => {
    const links = getContactLinks({ phone: '', whatsappNumber: '', whatsappMessage: '', email: '' });
    expect(links.phoneHref).toBe('');
    expect(links.whatsappHref).toBe('');
  });
});
