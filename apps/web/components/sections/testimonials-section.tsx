import { Quote, Star } from 'lucide-react';
import type { Testimonial } from '@hikeup/types';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';
import { SmartImage } from '@/components/smart-image';
import { Badge } from '@/components/ui/badge';
import { initials } from '@/lib/utils';
import { SectionHeading } from './section-heading';

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-3xl border border-line bg-white p-7 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-0.5" role="img" aria-label={`Rated ${testimonial.rating} out of 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={i < testimonial.rating ? 'size-5 fill-gold-400 text-gold-400' : 'size-5 text-slate-300'} aria-hidden />
          ))}
        </div>
        {testimonial.isSample && <Badge variant="neutral">Sample review</Badge>}
      </div>
      <Quote className="mt-5 size-8 text-gold-400" aria-hidden />
      <blockquote className="mt-2 flex-1 text-[15px] leading-relaxed text-slate-700">{testimonial.review}</blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
        {testimonial.imageUrl ? (
          <SmartImage src={testimonial.imageUrl} alt="" width={128} height={128} className="size-11 rounded-full object-cover" />
        ) : (
          <span className="grid size-11 place-items-center rounded-full bg-navy-800 text-sm font-bold text-gold-400" aria-hidden>
            {initials(testimonial.name)}
          </span>
        )}
        <span>
          <span className="block font-bold text-navy-900">{testimonial.name}</span>
          {testimonial.company && <span className="block text-sm text-slate-500">{testimonial.company}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

export function TestimonialsSection({ testimonials, limit = 3 }: { testimonials: Testimonial[]; limit?: number }) {
  if (!testimonials.length) return null;
  return (
    <section className="section bg-surface" aria-labelledby="testimonials-heading">
      <div className="container-page">
        <SectionHeading id="testimonials-heading" eyebrow="Testimonials" title="What our customers say" />
        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, limit).map((t) => (
            <RevealItem key={t.id}>
              <TestimonialCard testimonial={t} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
