'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import type { Project } from '@hikeup/types';
import { useConfirm } from '@/components/admin/confirm';
import { DataTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { PublishBadge } from '@/components/admin/publish-badge';
import { SmartImage } from '@/components/smart-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { useAdminList, useAdminMutation } from '@/hooks/use-admin';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';

function ProjectsInner() {
  const router = useRouter();
  const list = useAdminList<Project>('projects', { status: '' });
  const { confirm, dialog } = useConfirm();
  const remove = useAdminMutation((id: string) => api(`/admin/projects/${id}`, { method: 'DELETE' }), { success: 'Project deleted' });
  const toggle = useAdminMutation((p: Project) => api(`/admin/projects/${p.id}`, { method: 'PATCH', body: { status: p.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } }), { success: 'Project updated' });
  return (
    <>
      {dialog}
      <PageHeader
        title="Projects"
        description="Portfolio of completed work. Demo projects are placeholders — replace before publishing."
        actions={
          <Button asChild variant="navy">
            <Link href="/admin/projects/new">
              <Plus aria-hidden /> New project
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
        searchPlaceholder="Search projects"
        page={list.query.data?.page}
        totalPages={list.query.data?.totalPages}
        total={list.query.data?.total}
        onPage={list.setPage}
        onRowClick={(r) => router.push(`/admin/projects/${r.id}`)}
        filters={
          <Select aria-label="Filter by status" value={list.filters.status} onChange={(e) => list.setFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </Select>
        }
        columns={[
          {
            key: 'title',
            header: 'Project',
            primary: true,
            cell: (p) => (
              <span className="flex items-center gap-3">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {p.coverImageUrl && <SmartImage src={p.coverImageUrl} alt="" fill sizes="48px" className="object-cover" />}
                </span>
                <span>
                  <span className="block font-semibold text-navy-900">{p.title}</span>
                  <span className="flex gap-1.5 text-xs text-slate-500">
                    {p.location} {p.isDemo && <Badge variant="warning">Demo</Badge>}
                  </span>
                </span>
              </span>
            ),
          },
          { key: 'service', header: 'Service', cell: (p) => p.service?.title ?? '—' },
          { key: 'images', header: 'Images', cell: (p) => p.images.length },
          { key: 'completed', header: 'Completed', cell: (p) => formatDate(p.completedAt) },
          { key: 'status', header: 'Status', primary: true, cell: (p) => <PublishBadge status={p.status} /> },
          {
            key: 'actions',
            header: 'Actions',
            cell: (p) => (
              <span className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="ghost" onClick={() => toggle.mutate(p)}>
                  {p.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                </Button>
                <Button asChild size="sm" variant="ghost" aria-label="Edit">
                  <Link href={`/admin/projects/${p.id}`}>
                    <Pencil aria-hidden />
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" className="text-rose-600" aria-label="Delete" onClick={async () => (await confirm({ title: `Delete "${p.title}"?`, confirmLabel: 'Delete', destructive: true })) && remove.mutate(p.id)}>
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

export default function AdminProjectsPage() {
  return (
    <Suspense>
      <ProjectsInner />
    </Suspense>
  );
}
