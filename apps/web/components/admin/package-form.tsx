'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { packageColorPresets, slugify } from '@hikeup/ui';
import type { MaintenancePackage, PackagesResponse } from '@hikeup/types';
import { FieldList } from '@/components/admin/field-list';
import { FormSection } from '@/components/admin/form-section';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/feedback';
import { FormField } from '@/components/ui/form-field';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAdminMutation } from '@/hooks/use-admin';
import { api } from '@/lib/api-client';

const availability = z.enum(['INCLUDED', 'NOT_INCLUDED', 'CUSTOM']);
const schema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(80),
    slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and dashes').or(z.literal('')),
    description: z.string().max(2000).optional(),
    badge: z.string().max(60).optional(),
    color: z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Use a hex colour like #F5A800'),
    billingLabel: z.string().max(60).optional(),
    priceLabel: z.string().max(80).optional(),
    pricingNote: z.string().max(255).optional(),
    includedHours: z.string().max(120).optional(),
    sparePartsCoverage: z.string().max(160).optional(),
    freeLabour: z.boolean(),
    preventiveVisits: z.string().max(120).optional(),
    maintenanceVisits: z.string().max(120).optional(),
    featured: z.boolean(),
    active: z.boolean(),
    matrix: z.array(z.object({ comparisonRowId: z.string(), label: z.string(), availability: availability.or(z.literal('')), value: z.string().max(200).optional(), showOnCard: z.boolean() })),
    extras: z.array(z.object({ label: z.string().trim().min(1, 'Required').max(200) })),
  })
  .superRefine((v, ctx) =>
    v.matrix.forEach((m, i) => {
      if (m.availability === 'CUSTOM' && !m.value?.trim()) ctx.addIssue({ code: 'custom', path: ['matrix', i, 'value'], message: 'Enter the custom text' });
    }),
  );
type Values = z.infer<typeof schema>;

function toValues(pkg: MaintenancePackage | undefined, rows: PackagesResponse['comparisonRows']): Values {
  const byRow = new Map((pkg?.features ?? []).filter((f) => f.comparisonRowId).map((f) => [f.comparisonRowId!, f]));
  return {
    name: pkg?.name ?? '',
    slug: pkg?.slug ?? '',
    description: pkg?.description ?? '',
    badge: pkg?.badge ?? '',
    color: pkg?.color ?? '#04265f',
    billingLabel: pkg?.billingLabel ?? '',
    priceLabel: pkg?.priceLabel ?? '',
    pricingNote: pkg?.pricingNote ?? '',
    includedHours: pkg?.includedHours ?? '',
    sparePartsCoverage: pkg?.sparePartsCoverage ?? '',
    freeLabour: pkg?.freeLabour ?? false,
    preventiveVisits: pkg?.preventiveVisits ?? '',
    maintenanceVisits: pkg?.maintenanceVisits ?? '',
    featured: pkg?.featured ?? false,
    active: pkg?.active ?? true,
    matrix: rows.map((row) => {
      const f = byRow.get(row.id);
      return { comparisonRowId: row.id, label: row.label, availability: f?.availability ?? '', value: f?.value ?? '', showOnCard: f?.showOnCard ?? true };
    }),
    extras: (pkg?.features ?? []).filter((f) => !f.comparisonRowId).map((f) => ({ label: f.label })),
  };
}

function PackageFormInner({ pkg, rows }: { pkg?: MaintenancePackage; rows: PackagesResponse['comparisonRows'] }) {
  const router = useRouter();
  const { register, control, handleSubmit, formState, watch, setValue, getValues } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(pkg, rows) });
  const extras = useFieldArray({ control, name: 'extras' });
  const matrix = watch('matrix');
  const { errors } = formState;

  const save = useAdminMutation(
    (v: Values) => {
      const body = {
        name: v.name,
        slug: v.slug || slugify(v.name),
        description: v.description ?? '',
        badge: v.badge ?? '',
        color: v.color,
        billingLabel: v.billingLabel ?? '',
        priceLabel: v.priceLabel ?? '',
        pricingNote: v.pricingNote ?? '',
        includedHours: v.includedHours ?? '',
        sparePartsCoverage: v.sparePartsCoverage ?? '',
        freeLabour: v.freeLabour,
        preventiveVisits: v.preventiveVisits ?? '',
        maintenanceVisits: v.maintenanceVisits ?? '',
        featured: v.featured,
        active: v.active,
        features: [
          ...v.extras.map((e) => ({ label: e.label, availability: 'INCLUDED', showOnCard: true })),
          ...v.matrix
            .filter((m) => m.availability)
            .map((m) => ({ comparisonRowId: m.comparisonRowId, label: m.label, availability: m.availability, value: m.availability === 'CUSTOM' ? m.value : null, showOnCard: m.showOnCard })),
        ],
      };
      return pkg ? api<MaintenancePackage>(`/admin/packages/${pkg.id}`, { method: 'PATCH', body }) : api<MaintenancePackage>('/admin/packages', { method: 'POST', body });
    },
    {
      success: pkg ? 'Package saved' : 'Package created',
      invalidate: [['admin', 'packages'], ['admin', 'package']],
      onSuccess: (saved) => !pkg && router.replace(`/admin/packages/${(saved as MaintenancePackage).id}`),
    },
  );

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <FormSection title="Package details">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="name" label="Name" required error={errors.name?.message}>
              <Input {...register('name', { onBlur: (e) => !getValues('slug') && setValue('slug', slugify(e.target.value)) })} />
            </FormField>
            <FormField id="slug" label="Slug" error={errors.slug?.message}>
              <Input {...register('slug')} />
            </FormField>
            <FormField id="badge" label="Badge" hint='e.g. "Most Popular"'>
              <Input {...register('badge')} />
            </FormField>
            <FormField id="billingLabel" label="Billing label" hint='e.g. "Annual contract" or "Monthly"'>
              <Input {...register('billingLabel')} />
            </FormField>
          </div>
          <FormField id="description" label="Description">
            <Textarea rows={3} {...register('description')} />
          </FormField>
        </FormSection>

        <FormSection title="Pricing" description='Optional. Leave empty to show "Pricing on request" — prices are never hard-coded.'>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="priceLabel" label="Price label" hint='e.g. "2% of rental amount"'>
              <Input {...register('priceLabel')} />
            </FormField>
            <FormField id="pricingNote" label="Pricing note" hint='e.g. "or AED 1,000, whichever is higher"'>
              <Input {...register('pricingNote')} />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Coverage summary">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="includedHours" label="Included hours">
              <Input {...register('includedHours')} />
            </FormField>
            <FormField id="sparePartsCoverage" label="Spare parts coverage">
              <Input {...register('sparePartsCoverage')} />
            </FormField>
            <FormField id="preventiveVisits" label="Preventive maintenance visits">
              <Input {...register('preventiveVisits')} />
            </FormField>
            <FormField id="maintenanceVisits" label="Maintenance visits">
              <Input {...register('maintenanceVisits')} />
            </FormField>
          </div>
          <div className="flex items-center gap-3">
            <Controller control={control} name="freeLabour" render={({ field }) => <Switch id="freeLabour" checked={field.value} onCheckedChange={field.onChange} />} />
            <Label htmlFor="freeLabour">Free labour included</Label>
          </div>
        </FormSection>

        <FormSection title="Comparison table values" description="Set ✓ included, ✕ not included or custom text for each comparison row. Manage rows on the Packages page.">
          {rows.length === 0 && <p className="text-sm text-slate-500">No comparison rows yet.</p>}
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {rows.map((row, i) => (
              <div key={row.id} className="grid gap-3 p-3 sm:grid-cols-[1fr_170px_1fr_auto] sm:items-center">
                <span className="text-sm font-semibold text-navy-900">{row.label}</span>
                <Select aria-label={`${row.label} availability`} {...register(`matrix.${i}.availability`)}>
                  <option value="">— Not set —</option>
                  <option value="INCLUDED">✓ Included</option>
                  <option value="NOT_INCLUDED">✕ Not included</option>
                  <option value="CUSTOM">Custom text</option>
                </Select>
                <div>
                  <Input aria-label={`${row.label} custom text`} placeholder="Custom text" disabled={matrix[i]?.availability !== 'CUSTOM'} {...register(`matrix.${i}.value`)} />
                  {errors.matrix?.[i]?.value && <p className="mt-1 text-xs text-rose-600">{errors.matrix[i]?.value?.message}</p>}
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input type="checkbox" className="accent-navy-700" {...register(`matrix.${i}.showOnCard`)} /> On card
                </label>
              </div>
            ))}
          </div>
        </FormSection>

        <FormSection title="Extra card bullet points" description='Shown on the package card only, e.g. "Everything in Silver", "Priority service".'>
          <FieldList fields={extras.fields} onAdd={() => extras.append({ label: '' })} onRemove={extras.remove} onMove={extras.move} addLabel="Add bullet" render={(_, i) => <Input aria-label={`Bullet ${i + 1}`} {...register(`extras.${i}.label`)} />} />
        </FormSection>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <FormSection title="Display">
          <div className="flex items-center justify-between">
            <Label htmlFor="active">Active (visible)</Label>
            <Controller control={control} name="active" render={({ field }) => <Switch id="active" checked={field.value} onCheckedChange={field.onChange} />} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="featured">Featured (highlighted)</Label>
            <Controller control={control} name="featured" render={({ field }) => <Switch id="featured" checked={field.value} onCheckedChange={field.onChange} />} />
          </div>
          <FormField id="color" label="Design colour" error={errors.color?.message}>
            <Input {...register('color')} />
          </FormField>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Colour presets">
            {packageColorPresets.map((p) => (
              <button key={p.value} type="button" onClick={() => setValue('color', p.value, { shouldDirty: true })} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1 text-xs hover:border-navy-400">
                <span className="size-4 rounded-full" style={{ background: p.value }} aria-hidden /> {p.name}
              </button>
            ))}
          </div>
          <div className="rounded-xl p-4 text-white" style={{ background: watch('color') }}>
            <p className="font-display text-xl font-extrabold uppercase">{watch('name') || 'Preview'}</p>
            <p className="text-sm opacity-90">{watch('priceLabel') || 'Pricing on request'}</p>
          </div>
          <Button type="submit" variant="navy" className="w-full" loading={save.isPending}>
            <Save aria-hidden /> {pkg ? 'Save package' : 'Create package'}
          </Button>
        </FormSection>
      </aside>
    </form>
  );
}

export function PackageForm({ pkg }: { pkg?: MaintenancePackage }) {
  const rows = useQuery({ queryKey: ['admin', 'packages', 'all'], queryFn: () => api<PackagesResponse>('/admin/packages') });
  if (!rows.data) return <Skeleton className="h-[40rem] rounded-2xl" />;
  return <PackageFormInner pkg={pkg} rows={rows.data.comparisonRows} />;
}
