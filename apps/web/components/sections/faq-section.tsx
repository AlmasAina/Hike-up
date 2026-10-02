import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Faq } from '@hikeup/types';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { FaqList } from './faq-list';
import { SectionHeading } from './section-heading';

export function FaqSection({ faqs, limit = 6 }: { faqs: Faq[]; limit?: number }) {
  if (!faqs.length) return null;
  return (
    <section className="section bg-white" aria-labelledby="faq-heading">
      <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionHeading id="faq-heading" align="left" eyebrow="FAQ" title="Frequently asked questions" subtitle="Quick answers about our services, availability and how to request a quote." />
          <Reveal className="mt-8">
            <Button asChild variant="outline">
              <Link href="/faq">
                See all FAQs <ArrowRight aria-hidden />
              </Link>
            </Button>
          </Reveal>
        </div>
        <Reveal>
          <FaqList faqs={faqs.slice(0, limit)} />
        </Reveal>
      </div>
    </section>
  );
}
