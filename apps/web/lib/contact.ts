import { buildMailtoUrl, buildTelUrl, buildWhatsAppUrl, formatPhoneForDisplay } from '@hikeup/ui';
import type { PublicSettings } from '@hikeup/types';

export interface ContactLinks {
  phoneHref: string;
  phoneDisplay: string;
  whatsappHref: string;
  whatsappDisplay: string;
  emailHref: string;
  email: string;
}

/**
 * Every call / WhatsApp / email link on the site is derived from the centrally managed
 * site settings — nothing is hard-coded in components.
 */
export function getContactLinks(settings: Pick<PublicSettings, 'phone' | 'whatsappNumber' | 'whatsappMessage' | 'email'>, message?: string): ContactLinks {
  const whatsappSource = settings.whatsappNumber || settings.phone;
  return {
    phoneHref: buildTelUrl(settings.phone),
    phoneDisplay: formatPhoneForDisplay(settings.phone),
    whatsappHref: buildWhatsAppUrl(whatsappSource, message ?? settings.whatsappMessage),
    whatsappDisplay: formatPhoneForDisplay(whatsappSource),
    emailHref: buildMailtoUrl(settings.email),
    email: settings.email,
  };
}
