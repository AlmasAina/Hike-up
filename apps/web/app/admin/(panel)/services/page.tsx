'use client';

import { Eye, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import type { ServiceSummary } from '@hikeup/types';
import { useConfirm } from '@/components/admin/confirm';
import { DataTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { PublishBadge } from '@/components/admin/publish-badge';
import { moveId, ReorderButtons } from '@/components/admin/reorder-buttons';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { useAdminList, useAdminMutation } from '@/hooks/use-admin';
import { api } from '@/lib/api-client';
import { DynamicIcon } from '@/lib/icons';
import { formatDate } from '@/lib/utils';

type Row = ServiceSummary & { updatedAt: string };

function ServicesInner() {
  const router = useRouter();
  const list = useAdminList<Row>('services', { status: '' }, 50);
  const { confirm, dialog } = useConfirm();
  const remove = useAdminMutation((id: string) => api(`/admin/services/${id}`, { method: 'DELETE' }), { success: 'Service deleted' });
  const toggle = useAdminMutation((s: Row) => api(`/admin/services/${s.id}`, { method: 'PATCH', body: { status: s.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } }), { success: 'Service updated' });
  const reorder = useAdminMutation((ids: string[]) => api('/admin/services/reorder', { method: 'PUT', body: { ids } }), { success: 'Order saved' });
  const rows = list.query.data?.items ?? [];

  return (
    <>
      {dialog}
      <PageHeader
        title="Services"
        description="Services shown on the website. Drag order with the arrows; drafts are hidden from the public."
        actions={
          <Button asChild variant="navy">
            <Link href="/admin/services/new">
              <Plus aria-hidden /> New service
            </Link>
          </Button>
        }
      />
      <DataTable
        rows={list.query.data?.items}
        rowKey={(r) => r.id}
        loading={list.query.isLoading}
        error={list.query.error}
        onRetry={() => list.query.refetch()}
        search={list.search}
        onSearch={list.setSearch}
        searchPlaceholder="Search services"
        page={list.query.data?.page}
        totalPages={list.query.data?.totalPages}
        total={list.query.data?.total}
        onPage={list.setPage}
        onRowClick={(r) => router.push(`/admin/services/${r.id}`)}
        filters={
          <Select aria-label="Filter by status" value={list.filters.status} onChange={(e) => list.setFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </Select>
        }
        columns={[
          { key: 'order', header: 'Order', cell: (r) => <ReorderButtons index={rows.indexOf(r)} count={rows.length} onMove={(a, b) => reorder.mutate(moveId(rows.map((x) => x.id), a, b))} /> },
          {
            key: 'title',
            header: 'Service',
            primary: true,
            cell: (r) => (
              <span className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy-800 text-gold-400">
                  <DynamicIcon name={r.icon} className="size-4" />
                </span>
                <span>
                  <span className="flex items-center gap-1.5 font-semibold text-navy-900">
                    {r.title} {r.featured && <Star className="size-3.5 fill-gold-400 text-gold-400" aria-label="Featured" />}
                  </span>
                  <span className="block text-xs text-slate-500">/services/{r.slug}</span>
                </span>
              </span>
            ),
          },
          { key: 'status', header: 'Status', primary: true, cell: (r) => <PublishBadge status={r.status} /> },
          { key: 'updated', header: 'Updated', cell: (r) => <span className="text-xs text-slate-500">{formatDate(r.updatedAt)}</span> },
          {
            key: 'actions',
            header: 'Actions',
            cell: (r) => (
              <span className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="ghost" onClick={() => toggle.mutate(r)}>
                  {r.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                </Button>
                {r.status === 'PUBLISHED' && (
                  <Button asChild size="sm" variant="ghost" aria-label="View on website">
                    <a href={`/services/${r.slug}`} target="_blank" rel="noopener noreferrer">
                      <Eye aria-hidden />
                    </a>
                  </Button>
                )}
                <Button asChild size="sm" variant="ghost" aria-label="Edit">
                  <Link href={`/admin/services/${r.id}`}>
                    <Pencil aria-hidden />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600"
                  aria-label="Delete"
                  onClick={async () => {
                    if (await confirm({ title: `Delete "${r.title}"?`, description: 'The service will be removed from the website.', confirmLabel: 'Delete', destructive: true })) remove.mutate(r.id);
                  }}
                >
                  <Trash2 aria-hidden />
                </Button>
              </span>
            ),
          },
        ]}
      />
    </>
  );
}

export default function AdminServicesPage() {
  return (
    <Suspense>
      <ServicesInner />
    </Suspense>
  );
}
