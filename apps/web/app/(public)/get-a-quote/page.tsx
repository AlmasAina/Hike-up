import { CheckCircle2, Clock, MessageCircle, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { QuoteForm } from '@/components/forms/quote-form';
import { PageHero } from '@/components/sections/page-hero';
import { pageMetadata } from '@/lib/seo';
import { getServices, getSettings } from '@/lib/server-api';

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: 'Get a Quote',
  description: 'Request a free maintenance quotation from HIKE UP General Maintenance in Abu Dhabi. Add photos and our team will contact you.',
  path: '/get-a-quote',
});

export default async function GetAQuotePage({ searchParams }: { searchParams: Promise<{ service?: string; package?: string }> }) {
  const params = await searchParams;
  const [services, settings] = await Promise.all([getServices(), getSettings()]);
  const defaultService = services.find((s) => s.slug === params.service);
  const packageName = params.package?.slice(0, 60);

  return (
    <>
      <PageHero
        title="Get a Quote"
        subtitle="Tell us what you need. Our team reviews every request and contacts you to confirm details and pricing — no online booking or payment required."
        crumbs={[{ label: 'Get a Quote' }]}
      />
      <section className="section bg-surface">
        <div className="container-page grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <QuoteForm services={services} settings={settings} defaultServiceId={defaultService?.id} packageName={packageName} />
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl bg-hero p-7 text-white shadow-lift">
              <h2 className="text-xl font-extrabold text-white">What happens next?</h2>
              <ol className="mt-5 space-y-4 text-[15px]">
                {[
                  'We review your request and photos.',
                  'Our team contacts you by your preferred method.',
                  'You receive a clear quotation.',
                  'Once approved, we schedule the work.',
                ].map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gold-500 text-sm font-bold text-navy-950">{i + 1}</span>
                    <span className="text-navy-100">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <ul className="space-y-3 rounded-3xl border border-line bg-white p-7 text-[15px] shadow-soft">
              {[
                { Icon: Clock, text: `${settings.workingHours || '24/7'} support` },
                { Icon: ShieldCheck, text: 'Qualified, professional technicians' },
                { Icon: MessageCircle, text: 'Track requests in your customer account' },
                { Icon: CheckCircle2, text: 'No obligation — free to ask' },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-slate-700">
                  <Icon className="size-5 shrink-0 text-gold-500" aria-hidden /> {text}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
