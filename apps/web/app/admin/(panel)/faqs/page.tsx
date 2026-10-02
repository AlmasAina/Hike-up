'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Faq } from '@hikeup/types';
import { useConfirm } from '@/components/admin/confirm';
import { DataTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { PublishBadge } from '@/components/admin/publish-badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input, Select, Textarea } from '@/components/ui/input';
import { useAdminList, useAdminMutation } from '@/hooks/use-admin';
import { api } from '@/lib/api-client';

const schema = z.object({
  question: z.string().trim().min(5, 'Question is required').max(300),
  answer: z.string().trim().min(2, 'Answer is required').max(5000),
  category: z.string().max(80).optional(),
  sortOrder: z.coerce.number().int().min(0),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});
type Values = z.input<typeof schema>;
type Output = z.output<typeof schema>;

function FaqDialog({ item, open, onClose, nextOrder }: { item: Faq | null; open: boolean; onClose: () => void; nextOrder: number }) {
  const { register, handleSubmit, formState } = useForm<Values, unknown, Output>({
    resolver: zodResolver(schema),
    values: { question: item?.question ?? '', answer: item?.answer ?? '', category: item?.category ?? '', sortOrder: item?.sortOrder ?? nextOrder, status: item?.status ?? 'PUBLISHED' },
  });
  const save = useAdminMutation((v: Output) => (item ? api(`/admin/faqs/${item.id}`, { method: 'PATCH', body: { ...v, category: v.category ?? '' } }) : api('/admin/faqs', { method: 'POST', body: v })), { success: 'FAQ saved', onSuccess: onClose });
  const { errors } = formState;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent title={item ? 'Edit FAQ' : 'New FAQ'} className="max-w-2xl">
        <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="space-y-4">
          <FormField id="f-question" label="Question" required error={errors.question?.message}>
            <Input {...register('question')} />
          </FormField>
          <FormField id="f-answer" label="Answer" required error={errors.answer?.message}>
            <Textarea rows={5} {...register('answer')} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField id="f-category" label="Category" hint="Groups FAQs on the FAQ page">
              <Input {...register('category')} />
            </FormField>
            <FormField id="f-order" label="Order" error={errors.sortOrder?.message}>
              <Input type="number" min={0} {...register('sortOrder')} />
            </FormField>
            <FormField id="f-status" label="Status">
              <Select {...register('status')}>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </Select>
            </FormField>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="navy" loading={save.isPending}>
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FaqsInner() {
  const list = useAdminList<Faq>('faqs', { status: '' }, 50);
  const [editing, setEditing] = React.useState<Faq | null | 'new'>(null);
  const { confirm, dialog } = useConfirm();
  const remove = useAdminMutation((id: string) => api(`/admin/faqs/${id}`, { method: 'DELETE' }), { success: 'FAQ deleted' });
  return (
    <>
      {dialog}
      <FaqDialog item={editing === 'new' ? null : editing} open={editing !== null} onClose={() => setEditing(null)} nextOrder={list.query.data?.total ?? 0} />
      <PageHeader
        title="FAQs"
        description="Questions shown on the FAQ page and homepage."
        actions={
          <Button variant="navy" onClick={() => setEditing('new')}>
            <Plus aria-hidden /> New FAQ
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
        searchPlaceholder="Search FAQs"
        page={list.query.data?.page}
        totalPages={list.query.data?.totalPages}
        total={list.query.data?.total}
        onPage={list.setPage}
        onRowClick={(r) => setEditing(r)}
        filters={
          <Select aria-label="Filter by status" value={list.filters.status} onChange={(e) => list.setFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </Select>
        }
        columns={[
          { key: 'order', header: '#', cell: (f) => f.sortOrder },
          { key: 'q', header: 'Question', primary: true, cell: (f) => <span className="font-semibold text-navy-900">{f.question}</span> },
          { key: 'cat', header: 'Category', cell: (f) => f.category ?? '—' },
          { key: 'status', header: 'Status', primary: true, cell: (f) => <PublishBadge status={f.status} /> },
          {
            key: 'actions',
            header: 'Actions',
            cell: (f) => (
              <span className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="ghost" aria-label="Edit" onClick={() => setEditing(f)}>
                  <Pencil aria-hidden />
                </Button>
                <Button size="sm" variant="ghost" className="text-rose-600" aria-label="Delete" onClick={async () => (await confirm({ title: 'Delete this FAQ?', confirmLabel: 'Delete', destructive: true })) && remove.mutate(f.id)}>
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

export default function AdminFaqsPage() {
  return (
    <Suspense>
      <FaqsInner />
    </Suspense>
  );
}
