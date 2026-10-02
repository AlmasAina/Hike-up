import type { Metadata } from 'next';
import { LegalPageView } from '@/components/sections/legal-page';
import { pageMetadata } from '@/lib/seo';
import { getLegalPage } from '@/lib/server-api';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage('privacy-policy');
  return pageMetadata({ title: page?.title ?? 'Privacy Policy', path: '/privacy-policy' });
}

export default function Page() {
  return <LegalPageView slug="privacy-policy" />;
}
