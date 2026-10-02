import type { Metadata } from 'next';
import type { PublicSettings, ServiceSummary } from '@hikeup/types';
import { toE164 } from '@hikeup/ui';
import { publicEnv } from './env';

export function absoluteUrl(path = '/'): string {
  return `${publicEnv.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function pageMetadata(input: {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  noIndex?: boolean;
}): Metadata {
  const image = input.image ? (input.image.startsWith('http') ? input.image : absoluteUrl(input.image)) : absoluteUrl('/brand/og-default.png');
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: absoluteUrl(input.path) },
    openGraph: {
      title: input.title,
      description: input.description,
      url: absoluteUrl(input.path),
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
    },
    twitter: { card: 'summary_large_image', title: input.title, description: input.description, images: [image] },
    ...(input.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** schema.org LocalBusiness (HomeAndConstructionBusiness) built from admin-managed settings. */
export function localBusinessJsonLd(settings: PublicSettings, services: ServiceSummary[]) {
  const sameAs = [settings.facebookUrl, settings.instagramUrl, settings.linkedinUrl].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${publicEnv.siteUrl}/#business`,
    name: settings.companyName,
    ...(settings.companyLegalName ? { legalName: settings.companyLegalName } : {}),
    url: publicEnv.siteUrl,
    logo: absoluteUrl('/brand/hikeup-logo.png'),
    image: absoluteUrl('/brand/og-default.png'),
    description: settings.seoDescription,
    ...(settings.phone ? { telephone: toE164(settings.phone) } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.location
      ? { address: { '@type': 'PostalAddress', addressLocality: settings.location, addressCountry: 'AE' }, areaServed: settings.location }
      : {}),
    ...(/24\s*\/\s*7/.test(settings.workingHours)
      ? {
          openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '00:00',
            closes: '23:59',
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Maintenance services',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title, url: absoluteUrl(`/services/${s.slug}`) },
      })),
    },
  };
}
