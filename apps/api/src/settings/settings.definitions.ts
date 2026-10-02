import type { AdminSettings } from '@hikeup/types';

type Kind = 'string' | 'boolean';

/** Registry of every configurable setting. Unknown keys are rejected. */
export const SETTING_DEFINITIONS: Record<keyof AdminSettings, { kind: Kind; isPublic: boolean; fallback: string }> = {
  companyName: { kind: 'string', isPublic: true, fallback: 'HIKE UP General Maintenance' },
  companyLegalName: { kind: 'string', isPublic: true, fallback: '' },
  tagline: { kind: 'string', isPublic: true, fallback: '' },
  logoUrl: { kind: 'string', isPublic: true, fallback: '/brand/hikeup-logo.png' },
  faviconUrl: { kind: 'string', isPublic: true, fallback: '/favicon.ico' },
  email: { kind: 'string', isPublic: true, fallback: '' },
  phone: { kind: 'string', isPublic: true, fallback: '' },
  whatsappNumber: { kind: 'string', isPublic: true, fallback: '' },
  whatsappMessage: {
    kind: 'string',
    isPublic: true,
    fallback: 'Hello HIKE UP General Maintenance, I would like to request a quote.',
  },
  location: { kind: 'string', isPublic: true, fallback: 'Abu Dhabi, United Arab Emirates' },
  workingHours: { kind: 'string', isPublic: true, fallback: '24/7' },
  facebookUrl: { kind: 'string', isPublic: true, fallback: '' },
  instagramUrl: { kind: 'string', isPublic: true, fallback: '' },
  linkedinUrl: { kind: 'string', isPublic: true, fallback: '' },
  footerText: { kind: 'string', isPublic: true, fallback: '' },
  ctaTitle: { kind: 'string', isPublic: true, fallback: 'Need something fixed or maintained?' },
  ctaText: { kind: 'string', isPublic: true, fallback: '' },
  seoTitle: { kind: 'string', isPublic: true, fallback: 'HIKE UP General Maintenance' },
  seoDescription: { kind: 'string', isPublic: true, fallback: '' },
  googleSiteVerification: { kind: 'string', isPublic: true, fallback: '' },
  gaMeasurementId: { kind: 'string', isPublic: true, fallback: '' },
  licenceNumber: { kind: 'string', isPublic: true, fallback: '' },
  showLicenceNumber: { kind: 'boolean', isPublic: true, fallback: 'false' },
  notificationEmail: { kind: 'string', isPublic: false, fallback: '' },
};

export const SETTING_KEYS = Object.keys(SETTING_DEFINITIONS) as (keyof AdminSettings)[];
