import type { Metadata } from 'next';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { TestimonialCard } from '@/components/sections/testimonials-section';
import { EmptyState } from '@/components/ui/feedback';
import { pageMetadata } from '@/lib/seo';
import { getSettings, getTestimonials } from '@/lib/server-api';
import { MessageSquareQuote } from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: 'Testimonials',
  description: 'What customers say about HIKE UP General Maintenance.',
  path: '/testimonials',
});

export default async function TestimonialsPage() {
  const [testimonials, settings] = await Promise.all([getTestimonials(), getSettings()]);
  return (
    <>
      <PageHero title="Testimonials" subtitle="Feedback from customers we have helped." crumbs={[{ label: 'Testimonials' }]} />
      <section className="section bg-surface">
        <div className="container-page">
          {testimonials.length ? (
            <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <RevealItem key={t.id}>
                  <TestimonialCard testimonial={t} />
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <EmptyState icon={MessageSquareQuote} title="Reviews coming soon" description="We are collecting feedback from our customers. Check back soon." />
          )}
        </div>
      </section>
      <CtaBand settings={settings} />
    </>
  );
}
