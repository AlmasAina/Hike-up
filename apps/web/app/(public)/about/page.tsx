import type { Metadata } from 'next';
import { LogoFull } from '@/components/brand/logo';
import { Reveal } from '@/components/motion/reveal';
import { CtaBand } from '@/components/sections/cta-band';
import { FeatureCards } from '@/components/sections/feature-cards';
import { PageHero } from '@/components/sections/page-hero';
import { SectionHeading } from '@/components/sections/section-heading';
import { SmartImage } from '@/components/smart-image';
import { pageMetadata } from '@/lib/seo';
import { getContent, getSettings } from '@/lib/server-api';
import { Eye, Target } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent('about.');
  return pageMetadata({
    title: 'About Us',
    description: content['about.intro']?.subtitle ?? 'About HIKE UP General Maintenance — property maintenance in Abu Dhabi.',
    path: '/about',
  });
}

export default async function AboutPage() {
  const [settings, content] = await Promise.all([getSettings(), getContent('about.')]);
  const intro = content['about.intro'];
  const mission = content['about.mission'];
  const vision = content['about.vision'];
  const values = content['about.values'];
  const approach = content['about.approach'];
  const trust = content['about.why_trust'];

  return (
    <>
      <PageHero title={intro?.title ?? 'About HIKE UP'} subtitle={intro?.subtitle} crumbs={[{ label: 'About Us' }]} />

      <section className="section bg-white">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">Who we are</span>
            <div className="rich-text mt-5 text-lg" dangerouslySetInnerHTML={{ __html: intro?.body ?? '' }} />
          </Reveal>
          <Reveal delay={0.05} className="relative">
            <div className="relative overflow-hidden rounded-[2rem] bg-surface p-10 shadow-lift ring-1 ring-line">
              {intro?.imageUrl ? (
                <div className="relative aspect-[4/3]">
                  <SmartImage src={intro.imageUrl} alt="" fill sizes="(min-width:1024px) 40vw, 90vw" className="rounded-2xl object-cover" />
                </div>
              ) : (
                <LogoFull className="mx-auto w-full max-w-sm" />
              )}
            </div>
            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl bg-navy-800 px-5 py-4 text-white shadow-lift sm:block">
              <p className="text-xs font-semibold tracking-widest text-gold-300 uppercase">Available</p>
              <p className="font-display text-2xl font-extrabold">{settings.workingHours?.split('—')[0]?.trim() || '24/7'}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {(mission || vision) && (
        <section className="section bg-surface">
          <div className="container-page grid gap-6 md:grid-cols-2">
            {[
              { section: mission, Icon: Target },
              { section: vision, Icon: Eye },
            ]
              .filter((x) => x.section)
              .map(({ section, Icon }) => (
                <Reveal key={section!.key} className="rounded-3xl border border-line bg-white p-8 shadow-soft sm:p-10">
                  <span className="grid size-14 place-items-center rounded-2xl bg-gold-500 text-navy-950">
                    <Icon className="size-7" aria-hidden />
                  </span>
                  <h2 className="mt-6 text-2xl font-extrabold">{section!.title}</h2>
                  <div className="rich-text mt-3 text-lg" dangerouslySetInnerHTML={{ __html: section!.body ?? '' }} />
                </Reveal>
              ))}
          </div>
        </section>
      )}

      {values?.items.length ? (
        <section className="section bg-white">
          <div className="container-page">
            <SectionHeading eyebrow="What drives us" title={values.title ?? 'Our Values'} subtitle={values.subtitle} />
            <div className="mt-12">
              <FeatureCards items={values.items} columns={3} />
            </div>
          </div>
        </section>
      ) : null}

      {approach && (
        <section className="section relative overflow-hidden bg-hero">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" aria-hidden />
          <div className="container-page relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading align="left" tone="light" eyebrow="How we work" title={approach.title ?? 'Our Approach'} subtitle={approach.subtitle} />
            <Reveal>
              <div className="rich-text text-lg text-navy-100 [&_strong]:text-white" dangerouslySetInnerHTML={{ __html: approach.body ?? '' }} />
            </Reveal>
          </div>
        </section>
      )}

      {trust?.items.length ? (
        <section className="section bg-white">
          <div className="container-page">
            <SectionHeading eyebrow="Trust" title={trust.title ?? 'Why Customers Trust Us'} subtitle={trust.subtitle} />
            <div className="mt-12">
              <FeatureCards items={trust.items} columns={4} />
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand settings={settings} />
    </>
  );
}
