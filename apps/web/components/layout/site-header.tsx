'use client';

import { Clock, Mail, Menu, Phone, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import type { PublicSettings } from '@hikeup/types';
import { LogoLockup } from '@/components/brand/logo';
import { WhatsAppIcon } from '@/components/brand/social-icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { getContactLinks } from '@/lib/contact';
import { cn } from '@/lib/utils';
import { isActive, NAV_LINKS } from './nav-links';

export function SiteHeader({ settings }: { settings: PublicSettings }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const links = getContactLinks(settings);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Utility bar (desktop) */}
      <div className="hidden bg-navy-950 text-[13px] text-navy-100 lg:block">
        <div className="container-page flex h-10 items-center justify-between">
          <p className="flex items-center gap-2">
            <Clock className="size-3.5 text-gold-400" aria-hidden />
            <span>
              <strong className="font-semibold text-white">{settings.workingHours || '24/7'}</strong>
              {settings.location ? ` · ${settings.location}` : ''}
            </span>
          </p>
          <div className="flex items-center gap-5">
            {links.phoneHref && (
              <a href={links.phoneHref} className="flex items-center gap-1.5 transition hover:text-white">
                <Phone className="size-3.5 text-gold-400" aria-hidden />
                {links.phoneDisplay}
              </a>
            )}
            {links.emailHref && (
              <a href={links.emailHref} className="flex items-center gap-1.5 transition hover:text-white">
                <Mail className="size-3.5 text-gold-400" aria-hidden />
                {links.email}
              </a>
            )}
            <Link href="/customer/dashboard" className="flex items-center gap-1.5 transition hover:text-white">
              <UserRound className="size-3.5 text-gold-400" aria-hidden />
              My Account
            </Link>
          </div>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-40 border-b transition-all duration-300',
          scrolled ? 'border-line bg-white/90 shadow-soft backdrop-blur-xl' : 'border-transparent bg-white',
        )}
      >
        <a href="#main" className="sr-only rounded-lg bg-navy-800 px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50">
          Skip to content
        </a>
        <div className={cn('container-page flex items-center justify-between gap-4 transition-all', scrolled ? 'h-16' : 'h-[72px] lg:h-20')}>
          <LogoLockup logoUrl={settings.logoUrl} name={settings.companyName} />

          <nav aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative rounded-lg px-3 py-2 text-[15px] font-semibold transition-colors',
                        active ? 'text-navy-900' : 'text-slate-600 hover:text-navy-900',
                      )}
                    >
                      {link.label}
                      <span
                        className={cn(
                          'absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-gold-500 transition-transform duration-300',
                          active ? 'scale-x-100' : 'scale-x-0',
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {links.whatsappHref && (
              <a
                href={links.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="hidden size-10 place-items-center rounded-xl bg-[#25D366]/10 text-[#128C4B] transition hover:bg-[#25D366] hover:text-white sm:grid"
              >
                <WhatsAppIcon className="size-5" />
              </a>
            )}
            {links.phoneHref && (
              <a
                href={links.phoneHref}
                aria-label={`Call ${links.phoneDisplay}`}
                className="hidden size-10 place-items-center rounded-xl bg-navy-50 text-navy-700 transition hover:bg-navy-800 hover:text-white sm:grid"
              >
                <Phone className="size-5" aria-hidden />
              </a>
            )}
            <Button asChild size="md" className="hidden md:inline-flex">
              <Link href="/get-a-quote">Get a Quote</Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="grid size-11 place-items-center rounded-xl border border-line text-navy-800 transition hover:bg-navy-50 xl:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" aria-hidden />
                </button>
              </SheetTrigger>
              <SheetContent title="Main menu" className="overflow-y-auto">
                <div className="border-b border-line px-5 py-5">
                  <LogoLockup logoUrl={settings.logoUrl} name={settings.companyName} />
                </div>
                <nav aria-label="Mobile" className="flex-1 px-3 py-4">
                  <ul className="space-y-1">
                    {NAV_LINKS.map((link) => {
                      const active = isActive(pathname, link.href);
                      return (
                        <li key={link.href}>
                          <SheetClose asChild>
                            <Link
                              href={link.href}
                              aria-current={active ? 'page' : undefined}
                              className={cn(
                                'flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition',
                                active ? 'bg-navy-50 text-navy-900' : 'text-slate-700 hover:bg-slate-50',
                              )}
                            >
                              {link.label}
                              {active && <span className="size-2 rounded-full bg-gold-500" />}
                            </Link>
                          </SheetClose>
                        </li>
                      );
                    })}
                    <li>
                      <SheetClose asChild>
                        <Link href="/customer/dashboard" className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50">
                          <UserRound className="size-4" aria-hidden /> My Account
                        </Link>
                      </SheetClose>
                    </li>
                  </ul>
                </nav>
                <div className="space-y-2.5 border-t border-line p-5 safe-bottom">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/get-a-quote">Get a Quote</Link>
                  </Button>
                  <div className="grid grid-cols-2 gap-2.5">
                    {links.whatsappHref && (
                      <Button asChild variant="whatsapp">
                        <a href={links.whatsappHref} target="_blank" rel="noopener noreferrer">
                          <WhatsAppIcon /> WhatsApp
                        </a>
                      </Button>
                    )}
                    {links.phoneHref && (
                      <Button asChild variant="navy">
                        <a href={links.phoneHref}>
                          <Phone aria-hidden /> Call Now
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
