'use client';

import * as React from 'react';
import { Suspense } from 'react';
import type { AuditLogEntry } from '@hikeup/types';
import { DataTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select } from '@/components/ui/input';
import { useAdminList } from '@/hooks/use-admin';
import { formatDateTime } from '@/lib/utils';

const ENTITIES = ['users', 'services', 'packages', 'package_comparison_rows', 'projects', 'testimonials', 'faqs', 'quote_requests', 'contact_messages', 'technicians', 'site_settings', 'legal_pages', 'content_sections', 'uploads'];

function AuditInner() {
  const list = useAdminList<AuditLogEntry>('audit-logs', { entity: '' }, 50);
  const [selected, setSelected] = React.useState<AuditLogEntry | null>(null);
  return (
    <>
      <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && (
          <DialogContent title={selected.action} className="max-w-2xl">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">When</dt>
                <dd className="font-semibold">{formatDateTime(selected.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Who</dt>
                <dd className="font-semibold">{selected.actor ? `${selected.actor.name} (${selected.actor.email})` : 'System / anonymous'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Entity</dt>
                <dd className="font-semibold">
                  {selected.entity} {selected.entityId && <span className="font-mono text-xs">#{selected.entityId}</span>}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">IP address</dt>
                <dd className="font-mono">{selected.ip ?? '—'}</dd>
              </div>
            </dl>
            {selected.metadata && <pre className="mt-4 max-h-72 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">{JSON.stringify(selected.metadata, null, 2)}</pre>}
          </DialogContent>
        )}
      </Dialog>
      <PageHeader title="Audit Logs" description="Security-relevant actions: sign-ins, content changes, status updates and settings changes." />
      <DataTable
        rows={list.query.data?.items}
        rowKey={(r) => r.id}
        loading={list.query.isLoading}
        error={list.query.error}
        onRetry={() => list.query.refetch()}
        search={list.search}
        onSearch={list.setSearch}
        searchPlaceholder="Search action, entity, ID or user email"
        order={list.order}
        onToggleOrder={list.toggleOrder}
        page={list.query.data?.page}
        totalPages={list.query.data?.totalPages}
        total={list.query.data?.total}
        onPage={list.setPage}
        onRowClick={setSelected}
        filters={
          <Select aria-label="Filter by entity" value={list.filters.entity} onChange={(e) => list.setFilter('entity', e.target.value)}>
            <option value="">All entities</option>
            {ENTITIES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </Select>
        }
        columns={[
          { key: 'when', header: 'When', primary: true, cell: (l) => <span className="text-xs whitespace-nowrap">{formatDateTime(l.createdAt)}</span> },
          { key: 'action', header: 'Action', primary: true, cell: (l) => <Badge variant={l.action.includes('delete') || l.action.includes('failed') ? 'danger' : 'navy'}>{l.action}</Badge> },
          { key: 'entity', header: 'Entity', cell: (l) => <span className="text-xs">{l.entity}{l.entityId && <span className="block font-mono text-slate-400">{l.entityId.slice(0, 18)}</span>}</span> },
          { key: 'actor', header: 'User', cell: (l) => <span className="text-xs">{l.actor?.email ?? 'System'}</span> },
          { key: 'ip', header: 'IP', cell: (l) => <span className="font-mono text-xs">{l.ip ?? '—'}</span> },
        ]}
      />
    </>
  );
}

export default function AuditLogsPage() {
  return (
    <Suspense>
      <AuditInner />
    </Suspense>
  );
}
