'use client';

import { useQuery } from '@tanstack/react-query';
import { ImageIcon, MessageSquare } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { QUOTE_STATUSES, QUOTE_STATUS_LABELS, REQUEST_TYPE_LABELS, REQUEST_TYPES, type Paginated, type ServiceSummary } from '@hikeup/types';
import { DataTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Input, Select } from '@/components/ui/input';
import { useAdminList } from '@/hooks/use-admin';
import { isManager, useMe } from '@/hooks/use-auth';
import { api } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';
import type { AdminRequestRow } from './types';

function QuoteRequestsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: me } = useMe();
  const list = useAdminList<AdminRequestRow>('quote-requests', { status: params.get('status') ?? '', serviceId: '', type: '', from: '', to: '' });
  const services = useQuery({ queryKey: ['admin', 'services-options'], queryFn: () => api<Paginated<ServiceSummary>>('/admin/services?pageSize=100'), enabled: isManager(me) });
  const { data, isLoading, error, refetch } = list.query;

  return (
    <>
      <PageHeader title="Quote Requests" description={isManager(me) ? 'All quote, service and maintenance requests.' : 'Requests assigned to you.'} />
      <DataTable
        rows={data?.items}
        rowKey={(r) => r.id}
        loading={isLoading}
        error={error}
        onRetry={() => refetch()}
        search={list.search}
        onSearch={list.setSearch}
        searchPlaceholder="Search reference, name, email, phone, location"
        order={list.order}
        onToggleOrder={list.toggleOrder}
        page={data?.page}
        totalPages={data?.totalPages}
        total={data?.total}
        onPage={list.setPage}
        onRowClick={(r) => router.push(`/admin/quote-requests/${r.id}`)}
        emptyTitle="No requests found"
        filters={
          <>
            <Select aria-label="Filter by status" value={list.filters.status} onChange={(e) => list.setFilter('status', e.target.value)}>
              <option value="">All statuses</option>
              {QUOTE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {QUOTE_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
            {isManager(me) && (
              <Select aria-label="Filter by service" value={list.filters.serviceId} onChange={(e) => list.setFilter('serviceId', e.target.value)}>
                <option value="">All services</option>
                {services.data?.items.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </Select>
            )}
            <Select aria-label="Filter by type" value={list.filters.type} onChange={(e) => list.setFilter('type', e.target.value)}>
              <option value="">All types</option>
              {REQUEST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {REQUEST_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
            <Input type="date" aria-label="From date" value={list.filters.from} onChange={(e) => list.setFilter('from', e.target.value)} />
            <Input type="date" aria-label="To date" value={list.filters.to} onChange={(e) => list.setFilter('to', e.target.value)} />
          </>
        }
        columns={[
          {
            key: 'ref',
            header: 'Request',
            primary: true,
            cell: (r) => (
              <div>
                <p className="font-mono text-xs font-bold text-slate-500">{r.reference}</p>
                <p className="font-semibold text-navy-900">
                  {r.firstName} {r.lastName}
                </p>
                <p className="text-xs text-slate-500 md:hidden">{r.service?.title ?? 'General enquiry'}</p>
              </div>
            ),
          },
          { key: 'service', header: 'Service', cell: (r) => <span>{r.service?.title ?? <span className="text-slate-400">General enquiry</span>}</span> },
          { key: 'contact', header: 'Contact', cell: (r) => <span className="text-xs">{r.phone}<br /><span className="text-slate-500">{r.email}</span></span> },
          { key: 'location', header: 'Location', cell: (r) => r.location },
          {
            key: 'meta',
            header: 'Info',
            cell: (r) => (
              <span className="flex items-center gap-3 text-xs text-slate-500">
                {r.imageCount > 0 && (
                  <span className="flex items-center gap-1" title="Photos">
                    <ImageIcon className="size-3.5" aria-hidden /> {r.imageCount}
                  </span>
                )}
                {r.unreadMessages > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-gold-700" title="Unread messages">
                    <MessageSquare className="size-3.5" aria-hidden /> {r.unreadMessages}
                  </span>
                )}
                {r.technicians.length > 0 && <span>{r.technicians.map((t) => t.name).join(', ')}</span>}
              </span>
            ),
          },
          { key: 'date', header: 'Submitted', cell: (r) => <span className="text-xs whitespace-nowrap text-slate-600">{formatDateTime(r.createdAt)}</span> },
          { key: 'status', header: 'Status', primary: true, cell: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </>
  );
}

export default function AdminQuoteRequestsPage() {
  return (
    <Suspense>
      <QuoteRequestsInner />
    </Suspense>
  );
}
