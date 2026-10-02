'use client';

import { Phone } from 'lucide-react';
import { m, AnimatePresence } from 'motion/react';
import * as React from 'react';
import type { PublicSettings } from '@hikeup/types';
import { WhatsAppIcon } from '@/components/brand/social-icons';
import { getContactLinks } from '@/lib/contact';

/**
 * Floating WhatsApp (all screens) and Call (mobile) buttons.
 * Positioned with safe-area insets so they never cover the iOS home indicator.
 */
export function FloatingActions({ settings }: { settings: PublicSettings }) {
  const links = getContactLinks(settings);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  if (!links.whatsappHref && !links.phoneHref) return null;

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="pointer-events-none fixed right-4 z-30 flex flex-col items-end gap-3 sm:right-6"
          style={{ bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.75rem))' }}
        >
          {links.phoneHref && (
            <a
              href={links.phoneHref}
              aria-label={`Call ${links.phoneDisplay}`}
              className="pointer-events-auto grid size-13 place-items-center rounded-full bg-navy-800 text-white shadow-lift ring-4 ring-white transition hover:scale-105 hover:bg-navy-700 md:hidden"
            >
              <Phone className="size-6" aria-hidden />
            </a>
          )}
          {links.whatsappHref && (
            <a
              href={links.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="group pointer-events-auto flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-lift ring-4 ring-white transition hover:scale-105 hover:bg-[#1fbb59] sm:pr-5"
            >
              <span className="relative grid place-items-center">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/40 motion-reduce:hidden" aria-hidden />
                <WhatsAppIcon className="relative size-6" />
              </span>
              <span className="hidden text-sm font-semibold sm:inline">Chat on WhatsApp</span>
            </a>
          )}
        </m.div>
      )}
    </AnimatePresence>
  );
}
