'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, KeyRound, Mail, Phone, ShieldOff, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { buildMailtoUrl, buildTelUrl, buildWhatsAppUrl } from '@hikeup/ui';
import type { AuthUser, CustomerQuoteRequest } from '@hikeup/types';
import { useConfirm } from '@/components/admin/confirm';
import { WhatsAppIcon } from '@/components/brand/social-icons';
import { StatusBadge } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { useAdminMutation } from '@/hooks/use-admin';
import { api, errorMessage } from '@/lib/api-client';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const key = ['admin', 'customer', id];
  const { data, isLoading, error, refetch } = useQuery({ queryKey: key, queryFn: () => api<{ customer: AuthUser & { lastLoginAt: string | null }; requests: CustomerQuoteRequest[] }>(`/admin/customers/${id}`) });
  const { confirm, dialog } = useConfirm();
  const setStatus = useAdminMutation((status: 'ACTIVE' | 'DISABLED') => api(`/admin/customers/${id}/status`, { method: 'PATCH', body: { status } }), { success: 'Account updated', invalidate: [key, ['admin', 'customers']], revalidateSite: false });
  const reset = useAdminMutation(() => api(`/admin/customers/${id}/reset-password`, { method: 'POST', body: {} }), { success: 'Password reset link emailed to the customer', revalidateSite: false });

  if (error) return <ErrorState description={errorMessage(error)} onRetry={() => refetch()} />;
  if (isLoading || !data) return <Skeleton className="h-96 rounded-2xl" />;
  const c = data.customer;
  const active = c.status === 'ACTIVE';

  return (
    <div className="space-y-6">
      {dialog}
      <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> All customers
      </Link>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">
            {c.firstName} {c.lastName}
          </h1>
          <p className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            {c.email} <Badge variant={active ? 'success' : 'danger'}>{active ? 'Active' : 'Disabled'}</Badge> {c.emailVerified ? <Badge variant="success">Email verified</Badge> : <Badge>Unverified</Badge>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {c.phone && (
            <Button asChild size="sm" variant="navy">
              <a href={buildTelUrl(c.phone)}>
                <Phone aria-hidden /> Call
              </a>
            </Button>
          )}
          {(c.whatsapp || c.phone) && (
            <Button asChild size="sm" variant="whatsapp">
              <a href={buildWhatsAppUrl(c.whatsapp || c.phone)} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-4" /> WhatsApp
              </a>
            </Button>
          )}
          <Button asChild size="sm" variant="outline">
            <a href={buildMailtoUrl(c.email)}>
              <Mail aria-hidden /> Email
            </a>
          </Button>
          <Button size="sm" variant="outline" disabled={!active} loading={reset.isPending} onClick={async () => (await confirm({ title: 'Send password reset link?', description: `An email with a secure reset link will be sent to ${c.email}.`, confirmLabel: 'Send link' })) && reset.mutate(undefined)}>
            <KeyRound aria-hidden /> Reset password
          </Button>
          <Button
            size="sm"
            variant={active ? 'danger' : 'navy'}
            loading={setStatus.isPending}
            onClick={async () =>
              (await confirm({ title: active ? 'Disable this account?' : 'Enable this account?', description: active ? 'The customer will be signed out and unable to log in.' : undefined, destructive: active, confirmLabel: active ? 'Disable' : 'Enable' })) &&
              setStatus.mutate(active ? 'DISABLED' : 'ACTIVE')
            }
          >
            {active ? <ShieldOff aria-hidden /> : <ShieldCheck aria-hidden />} {active ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </div>
      <Card>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Phone', c.phone ?? '—'],
              ['WhatsApp', c.whatsapp ?? '—'],
              ['Joined', formatDate(c.createdAt)],
              ['Last login', formatDateTime(c.lastLoginAt)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-semibold text-navy-900">{v}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Requests ({data.requests.length})</CardTitle>
        </CardHeader>
        {data.requests.length ? (
          <ul className="divide-y divide-slate-100">
            {data.requests.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/quote-requests/${r.id}`} className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-slate-50">
                  <span>
                    <span className="block font-mono text-xs font-bold text-slate-500">{r.reference}</span>
                    <span className="block text-sm font-semibold text-navy-900">{r.service?.title ?? 'General enquiry'}</span>
                    <span className="text-xs text-slate-400">{formatDateTime(r.createdAt)}</span>
                  </span>
                  <StatusBadge status={r.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <CardContent>
            <EmptyState title="No requests yet" />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
