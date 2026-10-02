'use client';

import { ServerCrash } from 'lucide-react';
import { useEffect } from 'react';
import { StatusPage } from '@/components/status-page';
import { Button } from '@/components/ui/button';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="main">
      <StatusPage
        code="500"
        Icon={ServerCrash}
        title="Something went wrong"
        description="An unexpected error occurred. Please try again — if the problem continues, contact us by phone or WhatsApp."
        action={
          <Button size="lg" onClick={reset}>
            Try again
          </Button>
        }
      />
    </main>
  );
}
