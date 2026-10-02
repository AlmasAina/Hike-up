'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Save } from 'lucide-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import type { AdminSettings } from '@hikeup/types';
import { buildTelUrl, buildWhatsAppUrl } from '@hikeup/ui';
import { revalidatePublicSite } from '@/app/actions/revalidate';
import { FormSection } from '@/components/admin/form-section';
import { PageHeader } from '@/components/admin/page-header';
import { validateImageFile } from '@/components/forms/image-picker';
import { Button } from '@/components/ui/button';
import { ErrorState, Skeleton } from '@/components/ui/feedback';
import { FormField } from '@/components/ui/form-field';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAdminMutation } from '@/hooks/use-admin';
import { api, errorMessage, uploadWithProgress } from '@/lib/api-client';

const url = z.string().url('Must be a full URL starting with https://').or(z.literal(''));
const phone = z.string().regex(/^\+?[0-9][0-9\s\-()]{6,19}$/, 'Use international format, e.g. +971 50 123 4567').or(z.literal(''));
const schema = z.object({
  companyName: z.string().trim().min(2).max(160),
  companyLegalName: z.string().max(200),
  tagline: z.string().max(200),
  email: z.string().email('Invalid email').or(z.literal('')),
  phone,
  whatsappNumber: phone,
  whatsappMessage: z.string().max(500),
  location: z.string().max(300),
  workingHours: z.string().max(160),
  facebookUrl: url,
  instagramUrl: url,
  linkedinUrl: url,
  footerText: z.string().max(1000),
  ctaTitle: z.string().max(200),
  ctaText: z.string().max(500),
  seoTitle: z.string().max(160),
  seoDescription: z.string().max(320),
  googleSiteVerification: z.string().max(200),
  gaMeasurementId: z.string().regex(/^(G-[A-Z0-9]{4,20})?$/, 'Format: G-XXXXXXXXXX'),
  licenceNumber: z.string().max(80),
  showLicenceNumber: z.boolean(),
  notificationEmail: z.string().email('Invalid email').or(z.literal('')),
});
type Values = z.infer<typeof schema>;

function BrandUpload({ asset, current }: { asset: 'logo' | 'favicon'; current: string }) {
  const qc = useQueryClient();
  const ref = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const onFile = async (file?: File) => {
    if (!file) return;
    const err = validateImageFile(file);
    if (err) return toast.error(err);
    const form = new FormData();
    form.append('file', file);
    setBusy(true);
    try {
      await uploadWithProgress(`/admin/settings/${asset}`, form);
      await qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      void revalidatePublicSite();
      toast.success(`${asset === 'logo' ? 'Logo' : 'Favicon'} updated`);
    } catch (e) {
      toast.error('Upload failed', { description: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of configurable asset */}
      <img src={current} alt="" className="size-16 rounded-xl bg-slate-50 object-contain p-1 ring-1 ring-slate-200" />
      <div>
        <p className="text-sm font-semibold text-navy-900">{asset === 'logo' ? 'Logo' : 'Favicon'}</p>
        <p className="mb-2 max-w-xs truncate text-xs text-slate-500">{current}</p>
        <Button type="button" size="sm" variant="outline" loading={busy} onClick={() => ref.current?.click()}>
          Upload new {asset}
        </Button>
        <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
    </div>
  );
}

function SettingsForm({ settings }: { settings: AdminSettings }) {
  const { register, control, handleSubmit, formState, watch } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: settings });
  const save = useAdminMutation((v: Values) => api<AdminSettings>('/admin/settings', { method: 'PATCH', body: v }), { success: 'Settings saved — website updated', invalidate: [['admin', 'settings']] });
  const { errors } = formState;
  const wa = buildWhatsAppUrl(watch('whatsappNumber') || watch('phone'), watch('whatsappMessage'));
  const tel = buildTelUrl(watch('phone'));
  const f = (id: keyof Values, label: string, opts: { hint?: string; textarea?: boolean; type?: string } = {}) => (
    <FormField id={id} label={label} error={errors[id]?.message as string | undefined} hint={opts.hint}>
      {opts.textarea ? <Textarea rows={3} {...register(id)} /> : <Input type={opts.type ?? 'text'} {...register(id)} />}
    </FormField>
  );

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <FormSection title="Company">
          <div className="grid gap-5 sm:grid-cols-2">
            {f('companyName', 'Company name')}
            {f('companyLegalName', 'Legal / trade name')}
          </div>
          {f('tagline', 'Tagline')}
          <div className="grid gap-5 sm:grid-cols-2">
            {f('licenceNumber', 'Trade licence number')}
            <div className="flex items-end gap-3 pb-2.5">
              <Controller control={control} name="showLicenceNumber" render={({ field }) => <Switch id="showLicenceNumber" checked={field.value} onCheckedChange={field.onChange} />} />
              <Label htmlFor="showLicenceNumber">Show licence number on website</Label>
            </div>
          </div>
        </FormSection>
        <FormSection title="Contact details" description="Used for every Call, WhatsApp and email link across the website.">
          <div className="grid gap-5 sm:grid-cols-2">
            {f('phone', 'Phone', { hint: 'International format, e.g. +971 54 788 4035', type: 'tel' })}
            {f('whatsappNumber', 'WhatsApp number', { hint: 'Converted to wa.me format automatically', type: 'tel' })}
            {f('email', 'Public email', { type: 'email' })}
            {f('notificationEmail', 'Notification email', { hint: 'Receives new quote / contact alerts', type: 'email' })}
            {f('location', 'Location')}
            {f('workingHours', 'Working hours')}
          </div>
          {f('whatsappMessage', 'Default WhatsApp message', { textarea: true })}
          <div className="flex flex-wrap gap-3 rounded-xl bg-slate-50 p-3 text-xs">
            <span className="font-semibold text-slate-600">Test links:</span>
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-navy-700 underline">
                {wa.slice(0, 48)}… <ExternalLink className="size-3" aria-hidden />
              </a>
            ) : (
              <span className="text-slate-400">No WhatsApp number</span>
            )}
            {tel && (
              <a href={tel} className="text-navy-700 underline">
                {tel}
              </a>
            )}
          </div>
        </FormSection>
        <FormSection title="Social media" description="Leave empty to hide an icon.">
          {f('facebookUrl', 'Facebook URL', { type: 'url' })}
          {f('instagramUrl', 'Instagram URL', { type: 'url' })}
          {f('linkedinUrl', 'LinkedIn URL', { type: 'url' })}
        </FormSection>
        <FormSection title="Footer & calls to action">
          {f('footerText', 'Footer text', { textarea: true })}
          {f('ctaTitle', 'CTA title')}
          {f('ctaText', 'CTA text', { textarea: true })}
        </FormSection>
        <FormSection title="SEO & analytics">
          {f('seoTitle', 'Default SEO title')}
          {f('seoDescription', 'Default SEO description', { textarea: true })}
          <div className="grid gap-5 sm:grid-cols-2">
            {f('googleSiteVerification', 'Google Search Console verification', { hint: 'Content value of the google-site-verification meta tag' })}
            {f('gaMeasurementId', 'Google Analytics 4 ID', { hint: 'e.g. G-XXXXXXXXXX — leave empty to disable' })}
          </div>
        </FormSection>
      </div>
      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <FormSection title="Branding">
          <BrandUpload asset="logo" current={settings.logoUrl} />
          <BrandUpload asset="favicon" current={settings.faviconUrl} />
        </FormSection>
        <Button type="submit" variant="navy" size="lg" className="w-full" loading={save.isPending}>
          <Save aria-hidden /> Save settings
        </Button>
        {Object.keys(errors).length > 0 && <p role="alert" className="text-sm text-rose-600">Please fix the highlighted fields.</p>}
      </aside>
    </form>
  );
}

export default function AdminSettingsPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin', 'settings'], queryFn: () => api<AdminSettings>('/admin/settings') });
  if (error) return <ErrorState onRetry={() => refetch()} />;
  return (
    <>
      <PageHeader title="Site Settings" description="Company details, contact numbers, social links and SEO — all changes apply to the whole website." />
      {isLoading || !data ? <Skeleton className="h-[40rem] rounded-2xl" /> : <SettingsForm key={JSON.stringify(data)} settings={data} />}
    </>
  );
}
