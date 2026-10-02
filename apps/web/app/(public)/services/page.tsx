import type { Metadata } from 'next';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { ServiceCard } from '@/components/sections/service-card';
import { EmptyState } from '@/components/ui/feedback';
import { pageMetadata } from '@/lib/seo';
import { getServices, getSettings } from '@/lib/server-api';

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: 'Maintenance Services in Abu Dhabi',
  description:
    'Electrical, plumbing, AC & HVAC, painting, handyman, preventive, property and building maintenance services for homes and businesses in Abu Dhabi.',
  path: '/services',
});

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([getServices(), getSettings()]);
  return (
    <>
      <PageHero
        title="Our Maintenance Services"
        subtitle="One reliable team for electrical, plumbing, AC & HVAC, painting, handyman and preventive maintenance across Abu Dhabi."
        crumbs={[{ label: 'Services' }]}
      />
      <section className="section bg-surface">
        <div className="container-page">
          {services.length ? (
            <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, i) => (
                <RevealItem key={service.id}>
                  <ServiceCard service={service} priority={i < 3} />
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <EmptyState title="Services are being updated" description="Please contact us directly — we are happy to help." />
          )}
        </div>
      </section>
      <CtaBand settings={settings} />
    </>
  );
}
