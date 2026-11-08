import { formatPhoneForDisplay, toE164 } from '@hikeup/ui';
import { toast } from 'sonner';

/**
 * tel: links only dial on a phone (or a PC paired with one). On a computer they often do nothing,
 * so also copy the number and show it, letting staff dial it from their own phone.
 */
export function announceCall(phone: string | null | undefined): void {
  const number = toE164(phone);
  if (!number) return;
  navigator.clipboard?.writeText(number).catch(() => undefined);
  toast.message(`Call ${formatPhoneForDisplay(phone)}`, {
    description: 'Number copied. If no calling app opens on this computer, dial it from your phone.',
    duration: 10000,
  });
}

/** Opens a Gmail compose window in the browser; mailto: needs a desktop email app to be set up. */
export function buildGmailComposeUrl(email: string | null | undefined, subject?: string): string {
  const to = email?.trim();
  if (!to) return '';
  const params = new URLSearchParams({ view: 'cm', fs: '1', to, ...(subject ? { su: subject } : {}) });
  return `https://mail.google.com/mail/?${params.toString()}`;
}
