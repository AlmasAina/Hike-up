'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, FileText, Loader, MailWarning, MessageSquare, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { CustomerDashboardStats } from '@hikeup/types';
import { RequestRow } from '@/components/customer/request-row';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { useMe } from '@/hooks/use-auth';
import { api, errorMessage } from '@/lib/api-client';

export default function CustomerDashboardPage() {
  const { data: me } = useMe();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customer', 'dashboard'],
    queryFn: () => api<CustomerDashboardStats>('/customer/dashboard'),
  });
  const resend = useMutation({
    mutationFn: () => api('/auth/resend-verification', { method: 'POST', body: {} }),
    onSuccess: () => toast.success('Verification email sent'),
    onError: (e) => toast.error(errorMessage(e)),
  });

  const cards = [
    { label: 'Total requests', value: data?.total, Icon: FileText, tone: 'bg-navy-800 text-gold-400' },
    { label: 'Pending', value: data?.pending, Icon: Clock, tone: 'bg-sky-100 text-sky-700' },
    { label: 'In progress', value: data?.inProgress, Icon: Loader, tone: 'bg-amber-100 text-amber-800' },
    { label: 'Completed', value: data?.completed, Icon: CheckCircle2, tone: 'bg-emerald-100 text-emerald-700' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Hello{me ? `, ${me.firstName}` : ''} 👋</h1>
          <p className="mt-1 text-slate-600">Here is an overview of your maintenance requests.</p>
        </div>
        <Button asChild>
          <Link href="/get-a-quote">
            <Plus aria-hidden /> New request
          </Link>
        </Button>
      </div>

      {me && !me.emailVerified && (
        <div className="flex flex-col gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-amber-900">
            <MailWarning className="size-5 shrink-0" aria-hidden /> Please verify your email address so we can keep you updated.
          </p>
          <Button size="sm" variant="outline" onClick={() => resend.mutate()} loading={resend.isPending}>
            Resend verification email
          </Button>
        </div>
      )}

      {isError ? (
        <ErrorState description="We could not load your dashboard." onRetry={() => refetch()} />
      ) : (
        <>
          <section aria-label="Request summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map(({ label, value, Icon, tone }) => (
              <div key={label} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
                <span className={`grid size-10 place-items-center rounded-xl ${tone}`}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="mt-4 text-sm text-slate-500">{label}</p>
                {isLoading ? <Skeleton className="mt-1 h-8 w-12" /> : <p className="font-display text-3xl font-extrabold text-navy-900">{value ?? 0}</p>}
              </div>
            ))}
          </section>

          {data && data.unreadMessages > 0 && (
            <Link href="/customer/messages" className="flex items-center gap-3 rounded-2xl bg-navy-800 p-4 text-white shadow-soft hover:bg-navy-700">
              <MessageSquare className="size-5 text-gold-400" aria-hidden />
              You have {data.unreadMessages} unread message{data.unreadMessages > 1 ? 's' : ''} from our team.
            </Link>
          )}

          <section aria-labelledby="recent-heading">
            <div className="flex items-center justify-between">
              <h2 id="recent-heading" className="text-xl font-extrabold">
                Recent requests
              </h2>
              <Link href="/customer/requests" className="text-sm font-semibold text-navy-700 hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {isLoading && Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
              {data?.recent.map((r) => <RequestRow key={r.id} request={r} />)}
              {data && data.recent.length === 0 && (
                <EmptyState
                  title="No requests yet"
                  description="Submit a quote or service request and track its progress here."
                  action={
                    <Button asChild>
                      <Link href="/get-a-quote">Request a quote</Link>
                    </Button>
                  }
                />
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
