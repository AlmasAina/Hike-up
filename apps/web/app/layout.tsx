import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/providers';
import { publicEnv } from '@/lib/env';
import { getSettings } from '@/lib/server-api';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(publicEnv.siteUrl),
    title: { default: settings.seoTitle, template: `%s | ${settings.companyName}` },
    description: settings.seoDescription,
    applicationName: settings.companyName,
    openGraph: {
      siteName: settings.companyName,
      locale: 'en_AE',
      type: 'website',
      images: [{ url: '/brand/og-default.png', width: 1200, height: 630, alt: settings.companyName }],
    },
    twitter: { card: 'summary_large_image' },
    ...(settings.googleSiteVerification ? { verification: { google: settings.googleSiteVerification } } : {}),
    // Admin-uploaded favicon overrides the bundled app/icon.png.
    ...(settings.faviconUrl && settings.faviconUrl !== '/icon.png' ? { icons: { icon: settings.faviconUrl, apple: settings.faviconUrl } } : {}),
    formatDetection: { telephone: true, email: true, address: false },
  };
}

export const viewport: Viewport = {
  themeColor: '#04265f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AE" dir="ltr">
      <body className="min-h-dvh overflow-x-hidden">
        <noscript>
          <style>{'[data-reveal]{opacity:1!important;transform:none!important}'}</style>
        </noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
