'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { slugify } from '@hikeup/ui';
import type { Paginated, Project, ServiceSummary } from '@hikeup/types';
import { FormSection } from '@/components/admin/form-section';
import { GalleryUpload } from '@/components/admin/image-upload';
import { RichText } from '@/components/admin/rich-text';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminMutation } from '@/hooks/use-admin';
import { api } from '@/lib/api-client';

const schema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(180),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and dashes').or(z.literal('')),
  location: z.string().max(160).optional(),
  serviceId: z.string().optional(),
  completedAt: z.string().optional(),
  summary: z.string().max(500).optional(),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  images: z.array(z.object({ url: z.string(), key: z.string().nullable().optional(), alt: z.string().nullable().optional() })),
});
type Values = z.infer<typeof schema>;

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const services = useQuery({ queryKey: ['admin', 'services-options'], queryFn: () => api<Paginated<ServiceSummary>>('/admin/services?pageSize=100') });
  const { register, control, handleSubmit, formState, setValue, getValues } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: project?.title ?? '',
      slug: project?.slug ?? '',
      location: project?.location ?? '',
      serviceId: project?.service?.id ?? '',
      completedAt: project?.completedAt ?? '',
      summary: project?.summary ?? '',
      description: project?.description ?? '',
      status: project?.status ?? 'DRAFT',
      images: project?.images.map((i) => ({ url: i.url, key: i.key, alt: i.alt })) ?? [],
    },
  });
  const { errors } = formState;
  const save = useAdminMutation(
    (v: Values) => {
      const body = {
        ...v,
        slug: v.slug || slugify(v.title),
        serviceId: v.serviceId || null,
        completedAt: v.completedAt || null,
        images: v.images.map((img) => ({ url: img.url, ...(img.key ? { key: img.key } : {}), ...(img.alt ? { alt: img.alt } : {}) })),
      };
      return project ? api<Project>(`/admin/projects/${project.id}`, { method: 'PATCH', body }) : api<Project>('/admin/projects', { method: 'POST', body });
    },
    { success: project ? 'Project saved' : 'Project created', invalidate: [['admin', 'projects'], ['admin', 'project']], onSuccess: (p) => !project && router.replace(`/admin/projects/${(p as Project).id}`) },
  );

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {project?.isDemo && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
            This is seeded demo content. Replace the text and images with a genuine project before publishing.
          </p>
        )}
        <FormSection title="Project">
          <FormField id="title" label="Title" required error={errors.title?.message}>
            <Input {...register('title', { onBlur: (e) => !getValues('slug') && setValue('slug', slugify(e.target.value)) })} />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="slug" label="Slug" error={errors.slug?.message}>
              <Input {...register('slug')} />
            </FormField>
            <FormField id="location" label="Location">
              <Input {...register('location')} />
            </FormField>
            <FormField id="serviceId" label="Service category">
              <Select {...register('serviceId')}>
                <option value="">— None —</option>
                {services.data?.items.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField id="completedAt" label="Completion date">
              <Input type="date" {...register('completedAt')} />
            </FormField>
          </div>
          <FormField id="summary" label="Summary" hint="Shown on project cards">
            <Textarea rows={2} {...register('summary')} />
          </FormField>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Controller control={control} name="description" render={({ field }) => <RichText id="description" value={field.value} onChange={field.onChange} />} />
            {errors.description && <p className="text-xs text-rose-600">{errors.description.message}</p>}
          </div>
        </FormSection>
        <FormSection title="Images" description="The first image is used as the cover. Upload multiple photos at once.">
          <Controller control={control} name="images" render={({ field }) => <GalleryUpload value={field.value} onChange={field.onChange} folder="projects" max={30} />} />
        </FormSection>
      </div>
      <aside className="xl:sticky xl:top-24 xl:self-start">
        <FormSection title="Publishing">
          <FormField id="status" label="Status">
            <Select {...register('status')}>
              <option value="DRAFT">Draft (hidden)</option>
              <option value="PUBLISHED">Published</option>
            </Select>
          </FormField>
          <Button type="submit" variant="navy" className="w-full" loading={save.isPending}>
            <Save aria-hidden /> {project ? 'Save project' : 'Create project'}
          </Button>
        </FormSection>
      </aside>
    </form>
  );
}
