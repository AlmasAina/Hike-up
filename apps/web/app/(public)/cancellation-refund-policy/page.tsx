import type { Metadata } from 'next';
import { LegalPageView } from '@/components/sections/legal-page';
import { pageMetadata } from '@/lib/seo';
import { getLegalPage } from '@/lib/server-api';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage('cancellation-refund-policy');
  return pageMetadata({ title: page?.title ?? 'Cancellation & Refund Policy', path: '/cancellation-refund-policy' });
}

export default function Page() {
  return <LegalPageView slug="cancellation-refund-policy" />;
}
