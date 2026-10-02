import { Clock, FileBadge2, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import type { PublicSettings, ServiceSummary } from '@hikeup/types';
import { LogoFull } from '@/components/brand/logo';
import { FacebookIcon, InstagramIcon, LinkedInIcon, WhatsAppIcon } from '@/components/brand/social-icons';
import { getContactLinks } from '@/lib/contact';
import { NAV_LINKS } from './nav-links';

export function SiteFooter({ settings, services }: { settings: PublicSettings; services: ServiceSummary[] }) {
  const links = getContactLinks(settings);
  const socials = [
    { href: settings.facebookUrl, label: 'Facebook', Icon: FacebookIcon },
    { href: settings.instagramUrl, label: 'Instagram', Icon: InstagramIcon },
    { href: settings.linkedinUrl, label: 'LinkedIn', Icon: LinkedInIcon },
    { href: links.whatsappHref, label: 'WhatsApp', Icon: WhatsAppIcon },
  ].filter((s) => s.href);
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-navy-950 text-navy-100" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="pointer-events-none absolute -top-40 right-0 size-[30rem] rounded-full bg-gold-500/10 blur-3xl" aria-hidden />

      <div className="container-page relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-4">
          <LogoFull tone="light" className="w-44" />
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-navy-200">{settings.footerText}</p>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-2.5" aria-label="Social media">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-10 place-items-center rounded-xl bg-white/5 text-white ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-gold-500 hover:text-navy-950"
                  >
                    <Icon className="size-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-bold tracking-widest text-white uppercase">Quick Links</h3>
          <ul className="mt-5 space-y-3 text-[15px]">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-gold-400">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/get-a-quote" className="transition hover:text-gold-400">
                Get a Quote
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-sm font-bold tracking-widest text-white uppercase">Services</h3>
          <ul className="mt-5 space-y-3 text-[15px]">
            {services.slice(0, 10).map((service) => (
              <li key={service.id}>
                <Link href={`/services/${service.slug}`} className="transition hover:text-gold-400">
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-sm font-bold tracking-widest text-white uppercase">Contact</h3>
          <ul className="mt-5 space-y-4 text-[15px]">
            {links.phoneHref && (
              <li>
                <a href={links.phoneHref} className="flex gap-3 transition hover:text-gold-400">
                  <Phone className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden /> {links.phoneDisplay}
                </a>
              </li>
            )}
            {links.whatsappHref && (
              <li>
                <a href={links.whatsappHref} target="_blank" rel="noopener noreferrer" className="flex gap-3 transition hover:text-gold-400">
                  <WhatsAppIcon className="mt-0.5 size-4 shrink-0 text-gold-400" /> WhatsApp {links.whatsappDisplay}
                </a>
              </li>
            )}
            {links.emailHref && (
              <li>
                <a href={links.emailHref} className="flex gap-3 break-all transition hover:text-gold-400">
                  <Mail className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden /> {links.email}
                </a>
              </li>
            )}
            {settings.location && (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden /> {settings.location}
              </li>
            )}
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden /> {settings.workingHours || '24/7'}
            </li>
            {settings.showLicenceNumber && settings.licenceNumber && (
              <li className="flex gap-3">
                <FileBadge2 className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden /> Trade Licence {settings.licenceNumber}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-page flex flex-col gap-3 pt-6 pb-28 text-sm text-navy-300 md:pb-6 md:pr-56 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {settings.companyLegalName || settings.companyName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link href="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-and-conditions" className="hover:text-white">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href="/cancellation-refund-policy" className="hover:text-white">
                Cancellation Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
