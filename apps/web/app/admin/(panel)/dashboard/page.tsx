'use client';

import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Hourglass, Images, Inbox, Mail, Package, Users, Wrench } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { AdminDashboardStats } from '@hikeup/types';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState, Skeleton } from '@/components/ui/feedback';
import { isManager, useMe } from '@/hooks/use-auth';
import { api } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';
import { StaffDashboard } from './staff-dashboard';

const MonthlyAreaChart = dynamic(() => import('@/components/admin/charts').then((m) => m.MonthlyAreaChart), { ssr: false, loading: () => <Skeleton className="h-64" /> });
const ServiceBarChart = dynamic(() => import('@/components/admin/charts').then((m) => m.ServiceBarChart), { ssr: false, loading: () => <Skeleton className="h-64" /> });

function ManagerDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: () => api<AdminDashboardStats>('/admin/dashboard'), refetchInterval: 60_000 });
  if (isError) return <ErrorState description="Could not load dashboard statistics." onRetry={() => refetch()} />;
  const t = data?.totals;
  const cards = [
    { label: 'Total customers', value: t?.customers, Icon: Users, href: '/admin/customers' },
    { label: 'New quote requests', value: t?.newQuoteRequests, Icon: Inbox, href: '/admin/quote-requests?status=NEW', highlight: true },
    { label: 'Pending requests', value: t?.pendingRequests, Icon: Hourglass, href: '/admin/quote-requests' },
    { label: 'Active services', value: t?.activeServices, Icon: Wrench, href: '/admin/services' },
    { label: 'Active packages', value: t?.activePackages, Icon: Package, href: '/admin/packages' },
    { label: 'Projects', value: t?.projects, Icon: Images, href: '/admin/projects' },
    { label: 'Unread messages', value: t?.unreadMessages, Icon: Mail, href: '/admin/messages' },
  ];

  return (
    <>
      <section aria-label="Key figures" className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
        {cards.map(({ label, value, Icon, href, highlight }) => (
          <Link key={label} href={href} className={`rounded-2xl p-4 shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${highlight ? 'bg-navy-800 text-white ring-navy-800' : 'bg-white ring-slate-200'}`}>
            <Icon className={`size-5 ${highlight ? 'text-gold-400' : 'text-navy-600'}`} aria-hidden />
            <p className={`mt-3 text-xs font-medium ${highlight ? 'text-navy-200' : 'text-slate-500'}`}>{label}</p>
            {isLoading ? <Skeleton className="mt-1 h-7 w-10" /> : <p className={`font-display text-2xl font-extrabold ${highlight ? 'text-white' : 'text-navy-900'}`}>{value ?? 0}</p>}
          </Link>
        ))}
      </section>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quote requests by month</CardTitle>
          </CardHeader>
          <CardContent>{data ? <MonthlyAreaChart data={data.requestsByMonth} label="Requests" /> : <Skeleton className="h-64" />}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Requests by service</CardTitle>
          </CardHeader>
          <CardContent>{data ? <ServiceBarChart data={data.requestsByService} /> : <Skeleton className="h-64" />}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customer growth</CardTitle>
          </CardHeader>
          <CardContent>{data ? <MonthlyAreaChart data={data.customerGrowth} color="gold" label="New customers" /> : <Skeleton className="h-64" />}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Latest requests</CardTitle>
            <Link href="/admin/quote-requests" className="text-sm font-semibold text-navy-700 hover:underline">
              View all
            </Link>
          </CardHeader>
          <ul className="divide-y divide-slate-100">
            {data?.recentRequests.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/quote-requests/${r.id}`} className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-slate-50">
                  <span className="min-w-0">
                    <span className="block font-mono text-xs font-bold text-slate-500">{r.reference}</span>
                    <span className="block truncate text-sm font-semibold text-navy-900">
                      {r.firstName} {r.lastName} · {r.service?.title ?? 'General enquiry'}
                    </span>
                    <span className="block text-xs text-slate-400">{formatDateTime(r.createdAt)}</span>
                  </span>
                  <StatusBadge status={r.status} />
                </Link>
              </li>
            ))}
            {data && !data.recentRequests.length && <li className="px-6 py-10 text-center text-sm text-slate-500">No requests yet.</li>}
          </ul>
        </Card>
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  const { data: me } = useMe();
  return (
    <>
      <PageHeader
        title={`Welcome, ${me?.firstName ?? ''}`}
        description={isManager(me) ? 'Overview of requests, customers and website content.' : 'Requests assigned to you.'}
        actions={
          <Link href="/admin/quote-requests" className="inline-flex h-10 items-center gap-2 rounded-xl bg-navy-800 px-4 text-sm font-semibold text-white hover:bg-navy-700">
            <ClipboardList className="size-4" aria-hidden /> Quote requests
          </Link>
        }
      />
      {isManager(me) ? <ManagerDashboard /> : <StaffDashboard />}
    </>
  );
}
