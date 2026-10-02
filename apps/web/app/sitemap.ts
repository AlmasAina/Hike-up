import type { MetadataRoute } from 'next';
import { publicEnv } from '@/lib/env';
import { getProjects, getServices } from '@/lib/server-api';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.siteUrl;
  const now = new Date();
  const staticRoutes: [string, number, MetadataRoute.Sitemap[number]['changeFrequency']][] = [
    ['/', 1, 'weekly'],
    ['/services', 0.9, 'weekly'],
    ['/packages', 0.9, 'monthly'],
    ['/get-a-quote', 0.9, 'monthly'],
    ['/about', 0.7, 'monthly'],
    ['/projects', 0.7, 'weekly'],
    ['/testimonials', 0.5, 'monthly'],
    ['/faq', 0.6, 'monthly'],
    ['/contact', 0.8, 'monthly'],
    ['/privacy-policy', 0.2, 'yearly'],
    ['/terms-and-conditions', 0.2, 'yearly'],
    ['/cancellation-refund-policy', 0.2, 'yearly'],
  ];
  const [services, projects] = await Promise.all([getServices(), getProjects()]);
  return [
    ...staticRoutes.map(([path, priority, changeFrequency]) => ({ url: `${base}${path}`, lastModified: now, priority, changeFrequency })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: now, priority: 0.8, changeFrequency: 'monthly' as const })),
    ...projects.filter((p) => !p.isDemo).map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: now, priority: 0.5, changeFrequency: 'monthly' as const })),
  ];
}
