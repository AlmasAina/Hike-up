import type { Metadata } from 'next';
import { Info } from 'lucide-react';
import { ComparisonTable } from '@/components/packages/comparison-table';
import { PackageCards } from '@/components/packages/package-cards';
import { Reveal } from '@/components/motion/reveal';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { SectionHeading } from '@/components/sections/section-heading';
import { EmptyState } from '@/components/ui/feedback';
import { pageMetadata } from '@/lib/seo';
import { getPackages, getSettings } from '@/lib/server-api';

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: 'Property Maintenance Packages',
  description: 'Compare HIKE UP Bronze, Silver and Gold property maintenance packages: inspections, emergency support, preventive maintenance, spare parts and labour coverage.',
  path: '/packages',
});

export default async function PackagesPage() {
  const [{ packages, comparisonRows }, settings] = await Promise.all([getPackages(), getSettings()]);
  return (
    <>
      <PageHero
        title="Property Maintenance Packages"
        subtitle="Reliable · Professional · Always ready. Choose the plan that suits your property and your peace of mind."
        crumbs={[{ label: 'Packages' }]}
      />
      <section className="section bg-surface">
        <div className="container-page">
          {packages.length ? (
            <PackageCards packages={packages} />
          ) : (
            <EmptyState title="Packages coming soon" description="Contact us to discuss a maintenance plan for your property." />
          )}
        </div>
      </section>
      {comparisonRows.length > 0 && packages.length > 0 && (
        <section id="compare" className="section bg-white" aria-labelledby="compare-heading">
          <div className="container-page">
            <SectionHeading id="compare-heading" eyebrow="Compare" title="Package comparison" subtitle="See exactly what is included in each maintenance package." />
            <Reveal className="mt-12">
              <ComparisonTable packages={packages} rows={comparisonRows} />
            </Reveal>
            <p className="mt-6 flex items-start gap-2 text-sm text-slate-500">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              Package details are a summary. Final coverage, pricing and terms are confirmed in your maintenance agreement.
            </p>
          </div>
        </section>
      )}
      <CtaBand settings={settings} title="Not sure which package is right?" text="Tell us about your property and we will recommend the best option." />
    </>
  );
}
