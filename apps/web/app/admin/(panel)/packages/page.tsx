'use client';

import { useQuery } from '@tanstack/react-query';
import { Check, Pencil, Plus, Star, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import type { PackageComparisonRow, PackagesResponse } from '@hikeup/types';
import { useConfirm } from '@/components/admin/confirm';
import { IconPicker } from '@/components/admin/icon-picker';
import { PageHeader } from '@/components/admin/page-header';
import { moveId, ReorderButtons } from '@/components/admin/reorder-buttons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState, Skeleton } from '@/components/ui/feedback';
import { Input } from '@/components/ui/input';
import { useAdminMutation } from '@/hooks/use-admin';
import { api } from '@/lib/api-client';
import { DynamicIcon } from '@/lib/icons';

function RowEditor({ row, onSave, onCancel }: { row?: PackageComparisonRow; onSave: (v: { label: string; icon: string }) => void; onCancel: () => void }) {
  const [label, setLabel] = React.useState(row?.label ?? '');
  const [icon, setIcon] = React.useState(row?.icon ?? 'wrench');
  return (
    <div className="flex flex-wrap items-center gap-2">
      <IconPicker value={icon} onChange={setIcon} />
      <Input className="h-11 min-w-48 flex-1" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Row label, e.g. Spare Parts Coverage" aria-label="Row label" autoFocus />
      <Button size="icon" variant="navy" disabled={!label.trim()} onClick={() => onSave({ label: label.trim(), icon })} aria-label="Save row" className="size-11">
        <Check aria-hidden />
      </Button>
      <Button size="icon" variant="ghost" onClick={onCancel} aria-label="Cancel" className="size-11">
        <X aria-hidden />
      </Button>
    </div>
  );
}

export default function AdminPackagesPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin', 'packages', 'all'], queryFn: () => api<PackagesResponse>('/admin/packages') });
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = React.useState<string | 'new' | null>(null);
  const inv = { invalidate: [['admin', 'packages']] };
  const removePkg = useAdminMutation((id: string) => api(`/admin/packages/${id}`, { method: 'DELETE' }), { ...inv, success: 'Package deleted' });
  const togglePkg = useAdminMutation((p: { id: string; active: boolean }) => api(`/admin/packages/${p.id}`, { method: 'PATCH', body: { active: !p.active } }), { ...inv, success: 'Package updated' });
  const reorderPkg = useAdminMutation((ids: string[]) => api('/admin/packages/reorder', { method: 'PUT', body: { ids } }), { ...inv, success: 'Order saved' });
  const createRow = useAdminMutation((b: { label: string; icon: string }) => api('/admin/package-comparison-rows', { method: 'POST', body: b }), { ...inv, success: 'Row added', onSuccess: () => setEditing(null) });
  const updateRow = useAdminMutation((b: { id: string; label: string; icon: string }) => api(`/admin/package-comparison-rows/${b.id}`, { method: 'PATCH', body: { label: b.label, icon: b.icon } }), { ...inv, success: 'Row updated', onSuccess: () => setEditing(null) });
  const removeRow = useAdminMutation((id: string) => api(`/admin/package-comparison-rows/${id}`, { method: 'DELETE' }), { ...inv, success: 'Row deleted' });
  const reorderRows = useAdminMutation((ids: string[]) => api('/admin/package-comparison-rows/reorder', { method: 'PUT', body: { ids } }), { ...inv, success: 'Order saved' });

  if (error) return <ErrorState onRetry={() => refetch()} />;
  const pkgs = data?.packages ?? [];
  const rows = data?.comparisonRows ?? [];

  return (
    <>
      {dialog}
      <PageHeader
        title="Packages"
        description="Create unlimited maintenance packages and control the public comparison table."
        actions={
          <Button asChild variant="navy">
            <Link href="/admin/packages/new">
              <Plus aria-hidden /> New package
            </Link>
          </Button>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Packages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && <Skeleton className="h-40" />}
            {pkgs.map((p, i) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3">
                <ReorderButtons index={i} count={pkgs.length} onMove={(a, b) => reorderPkg.mutate(moveId(pkgs.map((x) => x.id), a, b))} />
                <span className="size-9 rounded-lg" style={{ background: p.color }} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-bold text-navy-900">
                    {p.name} {p.featured && <Star className="size-4 fill-gold-400 text-gold-400" aria-label="Featured" />}
                  </p>
                  <p className="text-xs text-slate-500">{p.priceLabel ?? 'Pricing on request'} · {p.features.length} features</p>
                </div>
                <Badge variant={p.active ? 'success' : 'neutral'}>{p.active ? 'Active' : 'Disabled'}</Badge>
                <Button size="sm" variant="ghost" onClick={() => togglePkg.mutate(p)}>
                  {p.active ? 'Disable' : 'Enable'}
                </Button>
                <Button asChild size="sm" variant="ghost" aria-label={`Edit ${p.name}`}>
                  <Link href={`/admin/packages/${p.id}`}>
                    <Pencil aria-hidden />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600"
                  aria-label={`Delete ${p.name}`}
                  onClick={async () => (await confirm({ title: `Delete the ${p.name} package?`, confirmLabel: 'Delete', destructive: true })) && removePkg.mutate(p.id)}
                >
                  <Trash2 aria-hidden />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Comparison table rows</CardTitle>
              <p className="text-sm text-slate-500">Rows of the public comparison table. Set values per package.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditing('new')}>
              <Plus aria-hidden /> Add row
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {editing === 'new' && <RowEditor onSave={(v) => createRow.mutate(v)} onCancel={() => setEditing(null)} />}
            {rows.map((row, i) =>
              editing === row.id ? (
                <RowEditor key={row.id} row={row} onSave={(v) => updateRow.mutate({ id: row.id, ...v })} onCancel={() => setEditing(null)} />
              ) : (
                <div key={row.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                  <ReorderButtons index={i} count={rows.length} onMove={(a, b) => reorderRows.mutate(moveId(rows.map((x) => x.id), a, b))} />
                  <DynamicIcon name={row.icon} className="size-4 text-navy-600" />
                  <span className="flex-1 text-sm font-medium text-navy-900">{row.label}</span>
                  <Button size="sm" variant="ghost" aria-label={`Edit ${row.label}`} onClick={() => setEditing(row.id)}>
                    <Pencil aria-hidden />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-600"
                    aria-label={`Delete ${row.label}`}
                    onClick={async () => (await confirm({ title: `Delete row "${row.label}"?`, description: 'Values for this row are removed from every package.', confirmLabel: 'Delete', destructive: true })) && removeRow.mutate(row.id)}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              ),
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
