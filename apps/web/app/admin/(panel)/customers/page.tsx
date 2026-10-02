'use client';

import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import type { CustomerSummary } from '@hikeup/types';
import { DataTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/input';
import { useAdminList } from '@/hooks/use-admin';
import { formatDate } from '@/lib/utils';

function CustomersInner() {
  const router = useRouter();
  const list = useAdminList<CustomerSummary>('customers', { status: '' });
  return (
    <>
      <PageHeader title="Customers" description="Registered customer accounts. Passwords are never visible to administrators." />
      <DataTable
        rows={list.query.data?.items}
        rowKey={(r) => r.id}
        loading={list.query.isLoading}
        error={list.query.error}
        onRetry={() => list.query.refetch()}
        search={list.search}
        onSearch={list.setSearch}
        searchPlaceholder="Search name, email or phone"
        order={list.order}
        onToggleOrder={list.toggleOrder}
        page={list.query.data?.page}
        totalPages={list.query.data?.totalPages}
        total={list.query.data?.total}
        onPage={list.setPage}
        onRowClick={(r) => router.push(`/admin/customers/${r.id}`)}
        filters={
          <Select aria-label="Filter by status" value={list.filters.status} onChange={(e) => list.setFilter('status', e.target.value)}>
            <option value="">All accounts</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </Select>
        }
        columns={[
          {
            key: 'name',
            header: 'Customer',
            primary: true,
            cell: (c) => (
              <span>
                <span className="block font-semibold text-navy-900">
                  {c.firstName} {c.lastName}
                </span>
                <span className="text-xs text-slate-500">{c.email}</span>
              </span>
            ),
          },
          { key: 'phone', header: 'Phone', cell: (c) => c.phone ?? '—' },
          { key: 'requests', header: 'Requests', cell: (c) => c.requestCount },
          { key: 'verified', header: 'Email', cell: (c) => (c.emailVerified ? <Badge variant="success">Verified</Badge> : <Badge>Unverified</Badge>) },
          { key: 'joined', header: 'Joined', cell: (c) => formatDate(c.createdAt) },
          { key: 'status', header: 'Status', primary: true, cell: (c) => <Badge variant={c.status === 'ACTIVE' ? 'success' : 'danger'}>{c.status === 'ACTIVE' ? 'Active' : 'Disabled'}</Badge> },
        ]}
      />
    </>
  );
}

export default function AdminCustomersPage() {
  return (
    <Suspense>
      <CustomersInner />
    </Suspense>
  );
}
