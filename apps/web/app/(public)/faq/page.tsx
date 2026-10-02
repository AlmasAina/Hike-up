import type { Metadata } from 'next';
import { Reveal } from '@/components/motion/reveal';
import { CtaBand } from '@/components/sections/cta-band';
import { FaqList } from '@/components/sections/faq-list';
import { PageHero } from '@/components/sections/page-hero';
import { EmptyState } from '@/components/ui/feedback';
import { pageMetadata } from '@/lib/seo';
import { getFaqs, getSettings } from '@/lib/server-api';

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: 'Frequently Asked Questions',
  description: 'Answers about HIKE UP maintenance services, 24/7 availability, emergency support, packages and how to request a quote.',
  path: '/faq',
});

export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([getFaqs(), getSettings()]);
  const groups = faqs.reduce<Record<string, typeof faqs>>((acc, faq) => {
    const key = faq.category ?? 'General';
    (acc[key] ??= []).push(faq);
    return acc;
  }, {});

  return (
    <>
      <PageHero title="Frequently Asked Questions" subtitle="Everything you need to know about working with HIKE UP." crumbs={[{ label: 'FAQ' }]} />
      <section className="section bg-surface">
        <div className="container-page max-w-4xl">
          {faqs.length ? (
            <div className="space-y-12">
              {Object.entries(groups).map(([category, items]) => (
                <Reveal key={category}>
                  <h2 className="mb-5 text-xl font-extrabold">{category}</h2>
                  <FaqList faqs={items} withSchema={false} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState title="FAQs coming soon" />
          )}
        </div>
      </section>
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
            }).replace(/</g, '\\u003c'),
          }}
        />
      )}
      <CtaBand settings={settings} title="Still have questions?" text="Our team is happy to help — reach out any time." />
    </>
  );
}
