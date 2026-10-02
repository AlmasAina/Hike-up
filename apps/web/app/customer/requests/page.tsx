'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { QUOTE_STATUSES, QUOTE_STATUS_LABELS, type CustomerQuoteRequest, type Paginated, type QuoteStatus } from '@hikeup/types';
import { RequestRow } from '@/components/customer/request-row';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { Input, Select } from '@/components/ui/input';
import { api } from '@/lib/api-client';
import { useDebounced } from '@/hooks/use-debounced';

export default function CustomerRequestsPage() {
  const [page, setPage] = React.useState(1);
  const [status, setStatus] = React.useState<QuoteStatus | ''>('');
  const [search, setSearch] = React.useState('');
  const debounced = useDebounced(search, 350);

  const qs = new URLSearchParams({ page: String(page), pageSize: '10' });
  if (status) qs.set('status', status);
  if (debounced) qs.set('search', debounced);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customer', 'requests', qs.toString()],
    queryFn: () => api<Paginated<CustomerQuoteRequest>>(`/customer/quote-requests?${qs}`),
    placeholderData: (prev) => prev,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">My Requests</h1>
          <p className="mt-1 text-slate-600">History of your quote, service and maintenance requests.</p>
        </div>
        <Button asChild>
          <Link href="/get-a-quote">
            <Plus aria-hidden /> New request
          </Link>
        </Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input className="pl-10" placeholder="Search by reference or description" aria-label="Search requests" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select className="sm:w-56" aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value as QuoteStatus | ''); setPage(1); }}>
          <option value="">All statuses</option>
          {QUOTE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {QUOTE_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>
      {isError && <ErrorState description="We could not load your requests." onRetry={() => refetch()} />}
      <div className="space-y-3">
        {isLoading && Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        {data?.items.map((r) => <RequestRow key={r.id} request={r} />)}
        {data && data.items.length === 0 && <EmptyState title="No requests found" description={status || debounced ? 'Try a different filter.' : 'Your submitted requests will appear here.'} />}
      </div>
      {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPage={setPage} />}
    </div>
  );
}
