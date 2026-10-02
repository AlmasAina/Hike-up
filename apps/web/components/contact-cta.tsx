import { ArrowRight, Phone } from 'lucide-react';
import Link from 'next/link';
import type { PublicSettings } from '@hikeup/types';
import { WhatsAppIcon } from '@/components/brand/social-icons';
import { Button } from '@/components/ui/button';
import { getContactLinks } from '@/lib/contact';
import { cn } from '@/lib/utils';

/** The standard "Get a Quote · WhatsApp · Call Now" CTA group. */
export function ContactCta({
  settings,
  tone = 'dark',
  whatsappMessage,
  className,
  showQuote = true,
  size = 'lg',
}: {
  settings: PublicSettings;
  tone?: 'dark' | 'light';
  whatsappMessage?: string;
  className?: string;
  showQuote?: boolean;
  size?: 'md' | 'lg';
}) {
  const links = getContactLinks(settings, whatsappMessage);
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:flex-wrap', className)}>
      {showQuote && (
        <Button asChild size={size}>
          <Link href="/get-a-quote">
            Get a Quote <ArrowRight aria-hidden />
          </Link>
        </Button>
      )}
      {links.whatsappHref && (
        <Button asChild size={size} variant="whatsapp">
          <a href={links.whatsappHref} target="_blank" rel="noopener noreferrer" data-testid="cta-whatsapp">
            <WhatsAppIcon /> WhatsApp Us
          </a>
        </Button>
      )}
      {links.phoneHref && (
        <Button asChild size={size} variant={tone === 'light' ? 'outline-light' : 'outline'}>
          <a href={links.phoneHref} data-testid="cta-call">
            <Phone aria-hidden /> Call Now
          </a>
        </Button>
      )}
    </div>
  );
}
