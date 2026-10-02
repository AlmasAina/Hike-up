import type { PublicSettings } from '@hikeup/types';
import { ContactCta } from '@/components/contact-cta';
import { Reveal } from '@/components/motion/reveal';

export function CtaBand({ settings, title, text }: { settings: PublicSettings; title?: string; text?: string }) {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="cta-heading">
      <div className="container-page">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-hero px-6 py-12 text-center shadow-lift sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" aria-hidden />
          <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-gold-500/25 blur-3xl" aria-hidden />
          <div className="relative mx-auto max-w-2xl">
            <h2 id="cta-heading" className="heading-lg text-white">
              {title ?? settings.ctaTitle}
            </h2>
            {(text ?? settings.ctaText) && <p className="mt-4 text-lg text-navy-100">{text ?? settings.ctaText}</p>}
            <ContactCta settings={settings} tone="light" className="mt-8 justify-center" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
