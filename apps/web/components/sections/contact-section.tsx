import type { PublicSettings } from '@hikeup/types';
import { ContactForm } from '@/components/forms/contact-form';
import { Reveal } from '@/components/motion/reveal';
import { ContactDetails } from './contact-details';
import { SectionHeading } from './section-heading';

export function ContactSection({ settings }: { settings: PublicSettings }) {
  return (
    <section className="section bg-surface" aria-labelledby="contact-heading">
      <div className="container-page">
        <SectionHeading id="contact-heading" eyebrow="Contact" title="Talk to our team" subtitle="Call, WhatsApp or send us a message — we are available around the clock." />
        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <ContactDetails settings={settings} />
          </Reveal>
          <Reveal delay={0.05}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
