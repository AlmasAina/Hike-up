'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Star, Trash2 } from 'lucide-react';
import * as React from 'react';
import { Suspense } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Testimonial } from '@hikeup/types';
import { useConfirm } from '@/components/admin/confirm';
import { DataTable } from '@/components/admin/data-table';
import { SingleImageUpload } from '@/components/admin/image-upload';
import { PageHeader } from '@/components/admin/page-header';
import { PublishBadge } from '@/components/admin/publish-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAdminList, useAdminMutation } from '@/hooks/use-admin';
import { api } from '@/lib/api-client';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  company: z.string().max(160).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  review: z.string().trim().min(5, 'Review is required').max(3000),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  isSample: z.boolean(),
  image: z.object({ url: z.string(), key: z.string().nullable().optional() }).nullable(),
});
type Values = z.input<typeof schema>;
type Output = z.output<typeof schema>;

function TestimonialDialog({ item, open, onClose }: { item: Testimonial | null; open: boolean; onClose: () => void }) {
  const { register, control, handleSubmit, formState } = useForm<Values, unknown, Output>({
    resolver: zodResolver(schema),
    values: {
      name: item?.name ?? '',
      company: item?.company ?? '',
      rating: item?.rating ?? 5,
      review: item?.review ?? '',
      status: item?.status ?? 'DRAFT',
      isSample: item?.isSample ?? false,
      image: item?.imageUrl ? { url: item.imageUrl, key: item.imageKey } : null,
    },
  });
  const save = useAdminMutation(
    ({ image, ...v }: Output) => {
      const body = { ...v, company: v.company ?? '', imageUrl: image?.url ?? '', imageKey: image?.key ?? '' };
      return item ? api(`/admin/testimonials/${item.id}`, { method: 'PATCH', body }) : api('/admin/testimonials', { method: 'POST', body });
    },
    { success: 'Testimonial saved', onSuccess: onClose },
  );
  const { errors } = formState;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent title={item ? 'Edit testimonial' : 'New testimonial'} className="max-w-2xl">
        <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="t-name" label="Customer name" required error={errors.name?.message}>
              <Input {...register('name')} />
            </FormField>
            <FormField id="t-company" label="Company / role">
              <Input {...register('company')} />
            </FormField>
            <FormField id="t-rating" label="Rating" error={errors.rating?.message}>
              <Select {...register('rating')}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {'★'.repeat(n)} ({n})
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField id="t-status" label="Status">
              <Select {...register('status')}>
                <option value="DRAFT">Draft (hidden)</option>
                <option value="PUBLISHED">Published</option>
              </Select>
            </FormField>
          </div>
          <FormField id="t-review" label="Review" required error={errors.review?.message}>
            <Textarea rows={4} {...register('review')} />
          </FormField>
          <div className="space-y-1.5">
            <Label>Photo (optional)</Label>
            <Controller control={control} name="image" render={({ field }) => <SingleImageUpload value={field.value ?? null} onChange={field.onChange} folder="testimonials" label="Photo" />} />
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
            <Controller control={control} name="isSample" render={({ field }) => <Switch id="t-sample" checked={field.value} onCheckedChange={field.onChange} />} />
            <Label htmlFor="t-sample" className="font-normal">
              Sample / placeholder review (shows a &quot;Sample review&quot; label publicly). Turn off only for genuine customer reviews.
            </Label>
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

function TestimonialsInner() {
  const list = useAdminList<Testimonial>('testimonials', { status: '' });
  const [editing, setEditing] = React.useState<Testimonial | null | 'new'>(null);
  const { confirm, dialog } = useConfirm();
  const remove = useAdminMutation((id: string) => api(`/admin/testimonials/${id}`, { method: 'DELETE' }), { success: 'Testimonial deleted' });
  return (
    <>
      {dialog}
      <TestimonialDialog item={editing === 'new' ? null : editing} open={editing !== null} onClose={() => setEditing(null)} />
      <PageHeader
        title="Testimonials"
        description="Customer reviews. Seeded sample reviews are marked and should be replaced with genuine feedback."
        actions={
          <Button variant="navy" onClick={() => setEditing('new')}>
            <Plus aria-hidden /> New testimonial
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
        searchPlaceholder="Search by name or company"
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
          {
            key: 'name',
            header: 'Customer',
            primary: true,
            cell: (t) => (
              <span>
                <span className="flex items-center gap-2 font-semibold text-navy-900">
                  {t.name} {t.isSample && <Badge variant="warning">Sample</Badge>}
                </span>
                <span className="text-xs text-slate-500">{t.company}</span>
              </span>
            ),
          },
          { key: 'rating', header: 'Rating', cell: (t) => <span className="flex items-center gap-1 text-gold-600"><Star className="size-4 fill-current" aria-hidden />{t.rating}</span> },
          { key: 'review', header: 'Review', cell: (t) => <span className="line-clamp-2 max-w-md text-slate-600">{t.review}</span> },
          { key: 'status', header: 'Status', primary: true, cell: (t) => <PublishBadge status={t.status} /> },
          {
            key: 'actions',
            header: 'Actions',
            cell: (t) => (
              <span className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="ghost" aria-label="Edit" onClick={() => setEditing(t)}>
                  <Pencil aria-hidden />
                </Button>
                <Button size="sm" variant="ghost" className="text-rose-600" aria-label="Delete" onClick={async () => (await confirm({ title: `Delete review by ${t.name}?`, confirmLabel: 'Delete', destructive: true })) && remove.mutate(t.id)}>
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

export default function AdminTestimonialsPage() {
  return (
    <Suspense>
      <TestimonialsInner />
    </Suspense>
  );
}
