import { SearchX } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { StatusPage } from '@/components/status-page';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <main id="main">
      <StatusPage
        code="404"
        Icon={SearchX}
        title="We couldn't find that page"
        description="The page may have moved or no longer exists. Try our services or get in touch."
        action={
          <Button asChild size="lg">
            <Link href="/services">Explore services</Link>
          </Button>
        }
      />
    </main>
  );
}
