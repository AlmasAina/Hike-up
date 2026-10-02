import { ShieldAlert } from 'lucide-react';
import type { Metadata } from 'next';
import { StatusPage } from '@/components/status-page';

export const metadata: Metadata = { title: 'Access denied', robots: { index: false } };

export default function ForbiddenPage() {
  return (
    <StatusPage
      code="403"
      Icon={ShieldAlert}
      title="Access denied"
      description="Your account does not have permission to view this page. If you believe this is a mistake, please contact an administrator."
    />
  );
}
