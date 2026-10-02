/**
 * Default site settings. Values come from environment variables so contact details are never
 * hard-coded; admins can change everything afterwards in Admin → Site Settings.
 * Seeding never overwrites a setting that already exists.
 */
const env = (key: string, fallback = ''): string => process.env[key]?.trim() || fallback;

export const settingsDefaults = (): { key: string; value: string; isPublic: boolean }[] => {
  const companyName = env('COMPANY_NAME', 'HIKE UP General Maintenance');
  return [
    { key: 'companyName', value: companyName, isPublic: true },
    { key: 'companyLegalName', value: env('COMPANY_LEGAL_NAME', companyName), isPublic: true },
    { key: 'tagline', value: 'Reliable · Professional · Always Ready', isPublic: true },
    { key: 'logoUrl', value: env('COMPANY_LOGO_URL', '/brand/hikeup-logo.png'), isPublic: true },
    { key: 'faviconUrl', value: env('COMPANY_FAVICON_URL', '/favicon.ico'), isPublic: true },
    { key: 'email', value: env('COMPANY_EMAIL'), isPublic: true },
    { key: 'phone', value: env('COMPANY_PHONE'), isPublic: true },
    { key: 'whatsappNumber', value: env('WHATSAPP_NUMBER', env('COMPANY_PHONE')), isPublic: true },
    {
      key: 'whatsappMessage',
      value: env(
        'WHATSAPP_DEFAULT_MESSAGE',
        'Hello HIKE UP General Maintenance, I would like to request a quote.',
      ),
      isPublic: true,
    },
    { key: 'location', value: env('COMPANY_LOCATION', 'Abu Dhabi, United Arab Emirates'), isPublic: true },
    { key: 'workingHours', value: env('COMPANY_WORKING_HOURS', '24/7 — Open every day'), isPublic: true },
    { key: 'facebookUrl', value: env('FACEBOOK_URL'), isPublic: true },
    { key: 'instagramUrl', value: env('INSTAGRAM_URL'), isPublic: true },
    { key: 'linkedinUrl', value: env('LINKEDIN_URL'), isPublic: true },
    {
      key: 'footerText',
      value:
        'Reliable general maintenance for homes and businesses in Abu Dhabi — electrical, plumbing, AC & HVAC, painting and handyman services, available 24/7.',
      isPublic: true,
    },
    { key: 'ctaTitle', value: 'Need something fixed or maintained?', isPublic: true },
    {
      key: 'ctaText',
      value: 'Tell us what you need and our team will get back to you with a clear quotation.',
      isPublic: true,
    },
    {
      key: 'seoTitle',
      value: 'HIKE UP General Maintenance | Property & Building Maintenance Abu Dhabi',
      isPublic: true,
    },
    {
      key: 'seoDescription',
      value:
        'General maintenance in Abu Dhabi for homes and businesses: electrical, plumbing, AC & HVAC, painting, handyman and preventive maintenance. Available 24/7.',
      isPublic: true,
    },
    { key: 'googleSiteVerification', value: env('GOOGLE_SITE_VERIFICATION'), isPublic: true },
    { key: 'gaMeasurementId', value: env('GA_MEASUREMENT_ID'), isPublic: true },
    { key: 'licenceNumber', value: env('COMPANY_LICENCE_NUMBER'), isPublic: true },
    { key: 'showLicenceNumber', value: env('COMPANY_SHOW_LICENCE_NUMBER', 'true'), isPublic: true },
    { key: 'notificationEmail', value: env('MAIL_TO', env('COMPANY_EMAIL')), isPublic: false },
  ];
};
