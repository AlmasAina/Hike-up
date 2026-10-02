import type { Faq } from '@hikeup/types';
import { JsonLd } from '@/components/json-ld';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

/** FAQ accordion with FAQPage structured data. */
export function FaqList({ faqs, withSchema = true }: { faqs: { id: string; question: string; answer: string }[] | Faq[]; withSchema?: boolean }) {
  return (
    <>
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>
              <p className="whitespace-pre-line">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {withSchema && faqs.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
          }}
        />
      )}
    </>
  );
}
