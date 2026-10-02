import type { ContentSection } from '@hikeup/types';
import { FeatureCards } from './feature-cards';
import { SectionHeading } from './section-heading';

export function WhyChooseSection({ content }: { content?: ContentSection }) {
  if (!content?.items.length) return null;
  return (
    <section className="section relative overflow-hidden bg-hero" aria-labelledby="why-heading">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" aria-hidden />
      <div className="container-page relative">
        <SectionHeading id="why-heading" eyebrow="Why HIKE UP" title={content.title ?? 'Why Choose HIKE UP?'} subtitle={content.subtitle} tone="light" />
        <div className="mt-12">
          <FeatureCards items={content.items} tone="dark" />
        </div>
      </div>
    </section>
  );
}
