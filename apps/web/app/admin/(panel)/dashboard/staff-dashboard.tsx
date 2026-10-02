'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import type { Paginated } from '@hikeup/types';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { api } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';
import type { AdminRequestRow } from '../quote-requests/types';

/** STAFF view: only requests assigned to the signed-in technician. */
export function StaffDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'quote-requests', 'mine'],
    queryFn: () => api<Paginated<AdminRequestRow>>('/admin/quote-requests?assignedToMe=true&pageSize=20'),
  });
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading) return <Skeleton className="h-64 rounded-2xl" />;
  if (!data?.items.length) return <EmptyState title="No assigned requests" description="Requests assigned to you by an administrator will appear here." />;
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {data.items.map((r) => (
        <li key={r.id}>
          <Link href={`/admin/quote-requests/${r.id}`} className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 hover:ring-navy-300">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-bold text-navy-800">{r.reference}</span>
              <StatusBadge status={r.status} />
            </div>
            <p className="mt-2 font-semibold text-navy-900">{r.service?.title ?? 'General enquiry'}</p>
            <p className="text-sm text-slate-500">
              {r.location} · {formatDateTime(r.createdAt)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
