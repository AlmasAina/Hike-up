import type { Metadata } from 'next';
import { ContactForm } from '@/components/forms/contact-form';
import { Reveal } from '@/components/motion/reveal';
import { ContactDetails } from '@/components/sections/contact-details';
import { PageHero } from '@/components/sections/page-hero';
import { ContactCta } from '@/components/contact-cta';
import { pageMetadata } from '@/lib/seo';
import { getSettings } from '@/lib/server-api';

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us',
  description: 'Contact HIKE UP General Maintenance by phone, WhatsApp or email. Available 24/7 in Abu Dhabi.',
  path: '/contact',
});

export default async function ContactPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHero title="Contact Us" subtitle="Call, WhatsApp or email us — our team is available 24/7." crumbs={[{ label: 'Contact' }]}>
        <ContactCta settings={settings} tone="light" />
      </PageHero>
      <section className="section bg-surface">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <ContactDetails settings={settings} />
          </Reveal>
          <Reveal delay={0.05}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
