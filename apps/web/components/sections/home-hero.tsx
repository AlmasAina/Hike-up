import { CheckCircle2 } from 'lucide-react';
import type { ContentSection, PublicSettings } from '@hikeup/types';
import { ContactCta } from '@/components/contact-cta';
import { Reveal } from '@/components/motion/reveal';
import { DynamicIcon } from '@/lib/icons';
import { HeroVisual } from './hero-visual';

export function HomeHero({ settings, content }: { settings: PublicSettings; content?: ContentSection }) {
  const title = content?.title ?? 'Reliable General Maintenance for Homes & Businesses';
  const subtitle =
    content?.subtitle ?? 'Professional electrical, plumbing, HVAC, painting and handyman services — available 24/7.';
  const highlights = content?.items ?? [];
  // Emphasise the first phrase before " for " in gold.
  const [lead, rest] = title.includes(' for ') ? [title.split(' for ')[0], `for ${title.split(' for ').slice(1).join(' for ')}`] : [title, ''];

  return (
    <section className="relative isolate overflow-hidden bg-hero text-white" aria-labelledby="hero-heading">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" aria-hidden />
      <div className="container-page grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:py-28">
        <div>
          <Reveal>
            <span className="eyebrow bg-white/10 text-gold-300 ring-white/15">
              <span className="size-1.5 rounded-full bg-gold-400 motion-safe:animate-pulse" aria-hidden />
              {settings.location ? `General Maintenance · ${settings.location.split(',')[0]}` : 'General Maintenance'}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 id="hero-heading" className="heading-xl mt-6 text-white">
              <span className="text-gradient-gold">{lead}</span> {rest}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-100 sm:text-xl">{subtitle}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <ContactCta settings={settings} tone="light" className="mt-9" />
          </Reveal>
          {highlights.length > 0 && (
            <Reveal delay={0.2}>
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-navy-100">
                {highlights.map((item) => (
                  <li key={item.title} className="flex items-center gap-2">
                    {item.icon ? <DynamicIcon name={item.icon} className="size-4 text-gold-400" /> : <CheckCircle2 className="size-4 text-gold-400" aria-hidden />}
                    {item.title}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
        <HeroVisual />
      </div>
      <svg className="absolute inset-x-0 -bottom-px text-white" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden>
        <path fill="currentColor" d="M0 60h1440V20C1200 50 960 60 720 40S240 0 0 30z" />
      </svg>
    </section>
  );
}
