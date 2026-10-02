'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Controller, useFieldArray, useForm, type Control, type UseFormRegister } from 'react-hook-form';
import { z } from 'zod';
import { slugify } from '@hikeup/ui';
import type { ServiceDetail } from '@hikeup/types';
import { FieldList } from '@/components/admin/field-list';
import { FormSection } from '@/components/admin/form-section';
import { IconPicker } from '@/components/admin/icon-picker';
import { GalleryUpload, SingleImageUpload } from '@/components/admin/image-upload';
import { RichText } from '@/components/admin/rich-text';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAdminMutation } from '@/hooks/use-admin';
import { api } from '@/lib/api-client';

const item = z.object({ title: z.string().trim().min(1, 'Required').max(200), description: z.string().max(1000).optional() });
const schema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(160),
  slug: z.string().trim().max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and dashes only').or(z.literal('')),
  shortDescription: z.string().trim().min(10, 'At least 10 characters').max(500),
  introduction: z.string().max(2000).optional(),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().min(1),
  image: z.object({ url: z.string(), key: z.string().nullable().optional(), alt: z.string().nullable().optional() }).nullable(),
  images: z.array(z.object({ url: z.string(), key: z.string().nullable().optional(), alt: z.string().nullable().optional() })),
  seoTitle: z.string().max(160).optional(),
  seoDescription: z.string().max(320).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  featured: z.boolean(),
  coverage: z.array(item),
  benefits: z.array(item),
  process: z.array(item),
  faqs: z.array(z.object({ question: z.string().trim().min(1, 'Required').max(300), answer: z.string().trim().min(1, 'Required').max(4000) })),
});
type Values = z.infer<typeof schema>;

function toValues(s?: ServiceDetail): Values {
  const pick = (type: string) => (s?.features ?? []).filter((f) => f.type === type).map((f) => ({ title: f.title, description: f.description ?? '' }));
  return {
    title: s?.title ?? '',
    slug: s?.slug ?? '',
    shortDescription: s?.shortDescription ?? '',
    introduction: s?.introduction ?? '',
    description: s?.description ?? '',
    icon: s?.icon ?? 'wrench',
    image: s?.imageUrl ? { url: s.imageUrl, key: s.imageKey } : null,
    images: (s?.images ?? []).map((i) => ({ url: i.url, key: i.key, alt: i.alt })),
    seoTitle: s?.seoTitle ?? '',
    seoDescription: s?.seoDescription ?? '',
    status: s?.status ?? 'DRAFT',
    featured: s?.featured ?? false,
    coverage: pick('COVERAGE'),
    benefits: pick('BENEFIT'),
    process: pick('PROCESS_STEP'),
    faqs: (s?.faqs ?? []).map((f) => ({ question: f.question, answer: f.answer })),
  };
}

function ItemList({ control, register, name, label, withDescription }: { control: Control<Values>; register: UseFormRegister<Values>; name: 'coverage' | 'benefits' | 'process'; label: string; withDescription: boolean }) {
  const { fields, append, remove, move } = useFieldArray({ control, name });
  return (
    <FieldList
      fields={fields}
      onAdd={() => append({ title: '', description: '' })}
      onRemove={remove}
      onMove={move}
      addLabel={`Add ${label.toLowerCase()}`}
      render={(_, i) => (
        <>
          <Input aria-label={`${label} ${i + 1} title`} placeholder="Title" {...register(`${name}.${i}.title`)} />
          {withDescription && <Textarea rows={2} aria-label={`${label} ${i + 1} description`} placeholder="Short description (optional)" {...register(`${name}.${i}.description`)} />}
        </>
      )}
    />
  );
}

export function ServiceForm({ service }: { service?: ServiceDetail }) {
  const router = useRouter();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(service) });
  const { register, control, handleSubmit, formState, setValue, watch, getValues } = form;
  const faqs = useFieldArray({ control, name: 'faqs' });
  const { errors } = formState;

  const save = useAdminMutation(
    (values: Values) => {
      const body = {
        title: values.title,
        slug: values.slug || slugify(values.title),
        shortDescription: values.shortDescription,
        introduction: values.introduction ?? '',
        description: values.description,
        icon: values.icon,
        imageUrl: values.image?.url ?? '',
        imageKey: values.image?.key ?? '',
        seoTitle: values.seoTitle ?? '',
        seoDescription: values.seoDescription ?? '',
        status: values.status,
        featured: values.featured,
        images: values.images.map((img) => ({ url: img.url, ...(img.key ? { key: img.key } : {}), ...(img.alt ? { alt: img.alt } : {}) })),
        features: [
          ...values.coverage.map((f) => ({ type: 'COVERAGE', title: f.title, description: f.description || null })),
          ...values.benefits.map((f) => ({ type: 'BENEFIT', title: f.title, description: f.description || null })),
          ...values.process.map((f) => ({ type: 'PROCESS_STEP', title: f.title, description: f.description || null })),
        ],
        faqs: values.faqs,
      };
      return service ? api<ServiceDetail>(`/admin/services/${service.id}`, { method: 'PATCH', body }) : api<ServiceDetail>('/admin/services', { method: 'POST', body });
    },
    {
      success: service ? 'Service saved' : 'Service created',
      invalidate: [['admin', 'services'], ['admin', 'service']],
      onSuccess: (saved) => !service && router.replace(`/admin/services/${(saved as ServiceDetail).id}`),
    },
  );

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <FormSection title="Basic information">
          <FormField id="title" label="Title" required error={errors.title?.message}>
            <Input
              {...register('title', {
                onBlur: (e) => !getValues('slug') && setValue('slug', slugify(e.target.value)),
              })}
            />
          </FormField>
          <FormField id="slug" label="URL slug" error={errors.slug?.message} hint={`Page URL: /services/${watch('slug') || 'auto-generated'}`}>
            <Input {...register('slug')} />
          </FormField>
          <FormField id="shortDescription" label="Short description" required error={errors.shortDescription?.message} hint="Shown on service cards">
            <Textarea rows={2} {...register('shortDescription')} />
          </FormField>
          <FormField id="introduction" label="Introduction" error={errors.introduction?.message} hint="Shown under the page title">
            <Textarea rows={2} {...register('introduction')} />
          </FormField>
          <div className="space-y-1.5">
            <Label htmlFor="description">Full description</Label>
            <Controller control={control} name="description" render={({ field }) => <RichText id="description" value={field.value} onChange={field.onChange} />} />
            {errors.description && <p className="text-xs font-medium text-rose-600">{errors.description.message}</p>}
          </div>
        </FormSection>

        <FormSection title="What we cover" description="Bullet list on the service page.">
          <ItemList control={control} register={register} name="coverage" label="Coverage item" withDescription={false} />
        </FormSection>
        <FormSection title="Benefits">
          <ItemList control={control} register={register} name="benefits" label="Benefit" withDescription />
        </FormSection>
        <FormSection title="Process steps">
          <ItemList control={control} register={register} name="process" label="Step" withDescription />
        </FormSection>
        <FormSection title="Service FAQs">
          <FieldList
            fields={faqs.fields}
            onAdd={() => faqs.append({ question: '', answer: '' })}
            onRemove={faqs.remove}
            onMove={faqs.move}
            addLabel="Add FAQ"
            render={(_, i) => (
              <>
                <Input aria-label={`Question ${i + 1}`} placeholder="Question" {...register(`faqs.${i}.question`)} />
                <Textarea rows={2} aria-label={`Answer ${i + 1}`} placeholder="Answer" {...register(`faqs.${i}.answer`)} />
              </>
            )}
          />
        </FormSection>
        <FormSection title="Gallery" description="Additional images (JPEG, PNG or WEBP).">
          <Controller control={control} name="images" render={({ field }) => <GalleryUpload value={field.value} onChange={field.onChange} folder="services" />} />
        </FormSection>
        <FormSection title="SEO" description="Leave empty to use the title and short description.">
          <FormField id="seoTitle" label="SEO title" error={errors.seoTitle?.message} hint={`${(watch('seoTitle') ?? '').length}/60 recommended`}>
            <Input {...register('seoTitle')} />
          </FormField>
          <FormField id="seoDescription" label="SEO description" error={errors.seoDescription?.message} hint={`${(watch('seoDescription') ?? '').length}/160 recommended`}>
            <Textarea rows={2} {...register('seoDescription')} />
          </FormField>
        </FormSection>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <FormSection title="Publishing">
          <FormField id="status" label="Status">
            <Select {...register('status')}>
              <option value="DRAFT">Draft (hidden)</option>
              <option value="PUBLISHED">Published</option>
            </Select>
          </FormField>
          <div className="flex items-center justify-between">
            <Label htmlFor="featured">Featured on homepage</Label>
            <Controller control={control} name="featured" render={({ field }) => <Switch id="featured" checked={field.value} onCheckedChange={field.onChange} />} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="icon">Icon</Label>
            <Controller control={control} name="icon" render={({ field }) => <IconPicker id="icon" value={field.value} onChange={field.onChange} />} />
          </div>
          <div className="space-y-1.5">
            <Label>Main image</Label>
            <Controller control={control} name="image" render={({ field }) => <SingleImageUpload value={field.value} onChange={field.onChange} folder="services" label="Image" />} />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" variant="navy" loading={save.isPending}>
              <Save aria-hidden /> {service ? 'Save changes' : 'Create service'}
            </Button>
            {service?.status === 'PUBLISHED' && (
              <Button asChild variant="outline">
                <a href={`/services/${service.slug}`} target="_blank" rel="noopener noreferrer">
                  Preview on website
                </a>
              </Button>
            )}
          </div>
          {Object.keys(errors).length > 0 && <p role="alert" className="text-sm text-rose-600">Please fix the highlighted fields.</p>}
        </FormSection>
      </aside>
    </form>
  );
}
