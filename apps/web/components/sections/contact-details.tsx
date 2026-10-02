import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { PublicSettings } from '@hikeup/types';
import { FacebookIcon, InstagramIcon, LinkedInIcon, WhatsAppIcon } from '@/components/brand/social-icons';
import { getContactLinks } from '@/lib/contact';

/** Contact cards — every value comes from Admin → Site Settings. */
export function ContactDetails({ settings }: { settings: PublicSettings }) {
  const links = getContactLinks(settings);
  const items = [
    links.phoneHref && { Icon: Phone, label: 'Call us', value: links.phoneDisplay, href: links.phoneHref, testId: 'contact-phone' },
    links.whatsappHref && { Icon: WhatsAppIcon, label: 'WhatsApp', value: `Chat on WhatsApp`, href: links.whatsappHref, external: true, testId: 'contact-whatsapp' },
    links.emailHref && { Icon: Mail, label: 'Email', value: links.email, href: links.emailHref, testId: 'contact-email' },
    settings.location && { Icon: MapPin, label: 'Location', value: settings.location },
    { Icon: Clock, label: 'Working hours', value: settings.workingHours || '24/7' },
  ].filter(Boolean) as {
    Icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    href?: string;
    external?: boolean;
    testId?: string;
  }[];
  const socials = [
    { href: settings.facebookUrl, label: 'Facebook', Icon: FacebookIcon },
    { href: settings.instagramUrl, label: 'Instagram', Icon: InstagramIcon },
    { href: settings.linkedinUrl, label: 'LinkedIn', Icon: LinkedInIcon },
  ].filter((s) => s.href);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold">{settings.companyName}</h2>
      {settings.companyLegalName && settings.companyLegalName !== settings.companyName && (
        <p className="-mt-2 text-sm text-slate-500">{settings.companyLegalName}</p>
      )}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {items.map(({ Icon, label, value, href, external, testId }) => {
          const body = (
            <>
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-navy-800 text-gold-400 transition group-hover:bg-gold-500 group-hover:text-navy-950">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold tracking-wider text-slate-500 uppercase">{label}</span>
                <span className="block font-bold break-words text-navy-900">{value}</span>
              </span>
            </>
          );
          return (
            <li key={label}>
              {href ? (
                <a
                  href={href}
                  data-testid={testId}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
                >
                  {body}
                </a>
              ) : (
                <div className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-soft">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
      {socials.length > 0 && (
        <div className="flex items-center gap-3 pt-2">
          <span className="text-sm font-semibold text-slate-600">Follow us:</span>
          {socials.map(({ href, label, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-xl bg-navy-50 text-navy-700 transition hover:bg-navy-800 hover:text-white">
              <Icon className="size-[18px]" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
