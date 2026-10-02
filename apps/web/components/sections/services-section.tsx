import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ServiceSummary } from '@hikeup/types';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/feedback';
import { DynamicIcon } from '@/lib/icons';
import { SectionHeading } from './section-heading';
import { ServiceCard } from './service-card';

export function ServicesSection({ services, limit = 6 }: { services: ServiceSummary[]; limit?: number }) {
  const shown = services.slice(0, limit);
  return (
    <section className="section bg-white" aria-labelledby="services-heading">
      <div className="container-page">
        <SectionHeading
          id="services-heading"
          eyebrow="Our Services"
          title="Complete maintenance under one roof"
          subtitle="From urgent repairs to planned preventive care, our multi-trade team keeps homes and businesses across Abu Dhabi running smoothly."
        />
        {shown.length ? (
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((service, i) => (
              <RevealItem key={service.id}>
                <ServiceCard service={service} priority={i < 3} />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <EmptyState className="mt-12" title="Services are being updated" description="Please contact us directly for any maintenance need." />
        )}
        {services.length > limit && (
          <div className="mt-12 text-center">
            <Button asChild variant="navy" size="lg">
              <Link href="/services">
                Explore all services <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

/** Compact icon strip of the core trades (mirrors the logo's service icons). */
export function ServiceCategories({ services }: { services: ServiceSummary[] }) {
  const featured = services.filter((s) => s.featured).slice(0, 6);
  if (!featured.length) return null;
  return (
    <section className="border-y border-line bg-surface py-12" aria-labelledby="categories-heading">
      <div className="container-page">
        <h2 id="categories-heading" className="text-center text-sm font-bold tracking-[0.2em] text-slate-500 uppercase">
          Service categories
        </h2>
        <RevealGroup className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {featured.map((service) => (
            <RevealItem key={service.id} className="h-full">
              <Link
                href={`/services/${service.slug}`}
                className="group flex h-full flex-col items-center gap-3 rounded-2xl bg-white p-5 text-center ring-1 ring-line transition hover:-translate-y-1 hover:shadow-soft hover:ring-gold-300"
              >
                <span className="grid size-16 place-items-center rounded-full border-2 border-gold-400 text-navy-800 transition group-hover:bg-navy-800 group-hover:text-white">
                  <DynamicIcon name={service.icon} className="size-7" />
                </span>
                <span className="text-sm font-bold text-navy-900">{service.title.replace(/ Services$/, '')}</span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
