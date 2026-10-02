import { LockKeyhole } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { StatusPage } from '@/components/status-page';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Sign in required', robots: { index: false } };

export default function UnauthorizedPage() {
  return (
    <StatusPage
      code="401"
      Icon={LockKeyhole}
      title="Please sign in"
      description="You need to be signed in to view this page."
      action={
        <Button asChild size="lg">
          <Link href="/auth/login">Sign in</Link>
        </Button>
      }
    />
  );
}
