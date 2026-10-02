import 'server-only';
import { cache } from 'react';
import type {
  ContentSection,
  Faq,
  LegalPage,
  PackagesResponse,
  Paginated,
  Project,
  PublicSettings,
  ServiceDetail,
  ServiceSummary,
  Testimonial,
} from '@hikeup/types';
import { apiInternalBase } from './env';

export const CONTENT_TAG = 'content';
const REVALIDATE_SECONDS = 60;

export class NotFoundError extends Error {}

/**
 * Server-side GET against the API with ISR caching. Public pages are regenerated at most every
 * 60 s, and immediately after an admin edit (see app/actions/revalidate.ts).
 * Network failures resolve to `null` so a temporarily unavailable API never breaks the build.
 */
async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${apiInternalBase()}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [CONTENT_TAG] },
      headers: { Accept: 'application/json' },
    });
    if (res.status === 404) throw new NotFoundError(path);
    if (!res.ok) {
      console.error(`[server-api] ${path} -> ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    console.error(`[server-api] ${path} failed: ${(error as Error).message}`);
    return null;
  }
}

/** Fallback used only if the API is unreachable (keeps layout intact; no contact data invented). */
const FALLBACK_SETTINGS: PublicSettings = {
  companyName: 'HIKE UP General Maintenance',
  companyLegalName: '',
  tagline: 'Reliable · Professional · Always Ready',
  logoUrl: '/brand/hikeup-logo.png',
  faviconUrl: '/icon.png',
  email: '',
  phone: '',
  whatsappNumber: '',
  whatsappMessage: '',
  location: '',
  workingHours: '24/7',
  facebookUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  footerText: '',
  ctaTitle: 'Need something fixed or maintained?',
  ctaText: '',
  seoTitle: 'HIKE UP General Maintenance',
  seoDescription: '',
  googleSiteVerification: '',
  gaMeasurementId: '',
  licenceNumber: '',
  showLicenceNumber: false,
};

export const getSettings = cache(async (): Promise<PublicSettings> => {
  return { ...FALLBACK_SETTINGS, ...((await apiGet<PublicSettings>('/settings')) ?? {}) };
});

export const getServices = cache(async (): Promise<ServiceSummary[]> => (await apiGet<ServiceSummary[]>('/services')) ?? []);

export const getService = cache(async (slug: string): Promise<ServiceDetail | null> => {
  try {
    return await apiGet<ServiceDetail>(`/services/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
});

export const getPackages = cache(
  async (): Promise<PackagesResponse> => (await apiGet<PackagesResponse>('/packages')) ?? { packages: [], comparisonRows: [] },
);

export const getProjects = cache(async (service?: string): Promise<Project[]> => {
  const qs = new URLSearchParams({ pageSize: '100' });
  if (service) qs.set('service', service);
  return (await apiGet<Paginated<Project>>(`/projects?${qs}`))?.items ?? [];
});

export const getProject = cache(async (slug: string): Promise<Project | null> => {
  try {
    return await apiGet<Project>(`/projects/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
});

export const getTestimonials = cache(async (): Promise<Testimonial[]> => (await apiGet<Testimonial[]>('/testimonials')) ?? []);

export const getFaqs = cache(async (): Promise<Faq[]> => (await apiGet<Faq[]>('/faqs')) ?? []);

export const getContent = cache(
  async (prefix?: string): Promise<Record<string, ContentSection>> =>
    (await apiGet<Record<string, ContentSection>>(`/content${prefix ? `?prefix=${encodeURIComponent(prefix)}` : ''}`)) ?? {},
);

export const getLegalPage = cache(async (slug: string): Promise<LegalPage | null> => {
  try {
    return await apiGet<LegalPage>(`/legal/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
});
