import { Analytics } from '@/components/analytics';
import { FloatingActions } from '@/components/layout/floating-actions';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { JsonLd } from '@/components/json-ld';
import { localBusinessJsonLd } from '@/lib/seo';
import { getServices, getSettings } from '@/lib/server-api';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  return (
    <>
      <SiteHeader settings={settings} />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
      <SiteFooter settings={settings} services={services} />
      <FloatingActions settings={settings} />
      <JsonLd data={localBusinessJsonLd(settings, services)} />
      <Analytics measurementId={settings.gaMeasurementId} />
    </>
  );
}
