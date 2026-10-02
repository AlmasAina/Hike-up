import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { stripHtml } from '@hikeup/ui';
import { ContactCta } from '@/components/contact-cta';
import { JsonLd } from '@/components/json-ld';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import { CtaBand } from '@/components/sections/cta-band';
import { FaqList } from '@/components/sections/faq-list';
import { PageHero } from '@/components/sections/page-hero';
import { ServiceCard } from '@/components/sections/service-card';
import { SmartImage } from '@/components/smart-image';
import { Button } from '@/components/ui/button';
import { DynamicIcon } from '@/lib/icons';
import { absoluteUrl, pageMetadata } from '@/lib/seo';
import { getContent, getService, getServices, getSettings } from '@/lib/server-api';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: 'Service not found' };
  const metadata = pageMetadata({
    title: service.seoTitle ?? service.title,
    description: service.seoDescription ?? service.shortDescription,
    path: `/services/${service.slug}`,
    image: service.ogImageUrl ?? (service.imageUrl && !service.imageUrl.endsWith('.svg') ? service.imageUrl : null),
  });
  // Admin-defined SEO titles are used verbatim (no "| Company" suffix).
  return service.seoTitle ? { ...metadata, title: { absolute: service.seoTitle } } : metadata;
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [service, settings, content] = await Promise.all([getService(slug), getSettings(), getContent('home.why_choose')]);
  if (!service) notFound();

  const coverage = service.features.filter((f) => f.type === 'COVERAGE');
  const benefits = service.features.filter((f) => f.type === 'BENEFIT');
  const process = service.features.filter((f) => f.type === 'PROCESS_STEP');
  const why = content['home.why_choose']?.items.slice(0, 4) ?? [];
  const waMessage = `Hello ${settings.companyName}, I would like a quote for ${service.title}.`;

  return (
    <>
      <PageHero title={service.title} subtitle={service.introduction ?? service.shortDescription} crumbs={[{ label: 'Services', href: '/services' }, { label: service.title }]}>
        <ContactCta settings={settings} tone="light" whatsappMessage={waMessage} />
      </PageHero>

      <section className="section bg-white">
        <div className="container-page grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            {service.imageUrl && (
              <Reveal className="relative mb-10 aspect-[3/2] overflow-hidden rounded-[2rem] bg-navy-900 shadow-lift">
                <SmartImage src={service.imageUrl} alt={service.images[0]?.alt ?? service.title} fill priority sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
              </Reveal>
            )}
            <Reveal>
              <h2 className="text-2xl font-extrabold">About this service</h2>
              <div className="rich-text mt-4 text-lg" dangerouslySetInnerHTML={{ __html: service.description }} />
            </Reveal>

            {benefits.length > 0 && (
              <div className="mt-14">
                <h2 className="text-2xl font-extrabold">Benefits</h2>
                <RevealGroup className="mt-6 grid gap-4 sm:grid-cols-2">
                  {benefits.map((b) => (
                    <RevealItem key={b.id} className="rounded-2xl border border-line bg-surface p-5">
                      <CheckCircle2 className="size-6 text-gold-500" aria-hidden />
                      <h3 className="mt-3 font-bold">{b.title}</h3>
                      {b.description && <p className="mt-1 text-[15px] text-slate-600">{b.description}</p>}
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
            )}

            {process.length > 0 && (
              <div className="mt-14">
                <h2 className="text-2xl font-extrabold">Our process</h2>
                <ol className="mt-6 space-y-4">
                  {process.map((step, i) => (
                    <Reveal as="li" key={step.id} className="flex gap-5 rounded-2xl border border-line bg-white p-5 shadow-soft">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy-800 font-display font-extrabold text-gold-400">{i + 1}</span>
                      <div>
                        <h3 className="font-bold">{step.title}</h3>
                        {step.description && <p className="mt-1 text-[15px] text-slate-600">{step.description}</p>}
                      </div>
                    </Reveal>
                  ))}
                </ol>
              </div>
            )}

            {service.faqs.length > 0 && (
              <div className="mt-14">
                <h2 className="text-2xl font-extrabold">Frequently asked questions</h2>
                <div className="mt-6">
                  <FaqList faqs={service.faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))} />
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {coverage.length > 0 && (
              <Reveal className="rounded-3xl border border-line bg-white p-7 shadow-soft">
                <h2 className="flex items-center gap-3 text-xl font-extrabold">
                  <span className="grid size-10 place-items-center rounded-xl bg-gold-500 text-navy-950">
                    <DynamicIcon name={service.icon} className="size-5" />
                  </span>
                  What we cover
                </h2>
                <ul className="mt-5 space-y-3">
                  {coverage.map((c) => (
                    <li key={c.id} className="flex gap-3 text-[15px] text-slate-700">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
                      {c.title}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
            {why.length > 0 && (
              <Reveal className="rounded-3xl bg-hero p-7 text-white shadow-lift">
                <h2 className="flex items-center gap-2 text-xl font-extrabold text-white">
                  <ShieldCheck className="size-6 text-gold-400" aria-hidden /> Why choose HIKE UP
                </h2>
                <ul className="mt-5 space-y-4">
                  {why.map((w) => (
                    <li key={w.title}>
                      <p className="font-bold">{w.title}</p>
                      {w.description && <p className="text-sm text-navy-200">{w.description}</p>}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-7 w-full">
                  <Link href={`/get-a-quote?service=${service.slug}`}>
                    Get a quote for this service <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </Reveal>
            )}
          </aside>
        </div>
      </section>

      {service.relatedServices.length > 0 && (
        <section className="section bg-surface">
          <div className="container-page">
            <h2 className="heading-lg">Related services</h2>
            <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {service.relatedServices.map((s) => (
                <RevealItem key={s.id}>
                  <ServiceCard service={s} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      <CtaBand settings={settings} title={`Need ${service.title.toLowerCase()}?`} text="Tell us about the job and we will get back to you with a clear quotation." />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.title,
          description: stripHtml(service.description, 300),
          url: absoluteUrl(`/services/${service.slug}`),
          areaServed: settings.location || 'Abu Dhabi',
          provider: { '@id': absoluteUrl('/#business') },
        }}
      />
    </>
  );
}
