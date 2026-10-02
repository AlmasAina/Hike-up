import type { ContentSection } from '@hikeup/types';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';
import { DynamicIcon } from '@/lib/icons';
import { SectionHeading } from './section-heading';

export function HowItWorks({ content }: { content?: ContentSection }) {
  if (!content?.items.length) return null;
  return (
    <section className="section bg-surface" aria-labelledby="how-heading">
      <div className="container-page">
        <SectionHeading id="how-heading" eyebrow="Simple process" title={content.title ?? 'How It Works'} subtitle={content.subtitle} />
        <RevealGroup as="ul" className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.items.map((step, i) => (
            <RevealItem as="li" key={step.title} className="relative flex gap-5 rounded-3xl border border-line bg-white p-6 shadow-soft">
              <div className="flex flex-col items-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-navy-800 text-gold-400">
                  <DynamicIcon name={step.icon} className="size-6" />
                </span>
                <span className="mt-3 font-display text-3xl font-extrabold text-navy-100">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">{step.title}</h3>
                {step.description && <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{step.description}</p>}
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
