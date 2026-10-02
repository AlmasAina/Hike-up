'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Phone, Send } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  CONTACT_METHOD_LABELS,
  CONTACT_METHODS,
  MAX_QUOTE_IMAGES,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPES,
  type PublicSettings,
  type ServiceSummary,
} from '@hikeup/types';
import { WhatsAppIcon } from '@/components/brand/social-icons';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input, Select, Textarea } from '@/components/ui/input';
import { useMe } from '@/hooks/use-auth';
import { errorMessage, uploadWithProgress } from '@/lib/api-client';
import { getContactLinks } from '@/lib/contact';
import { cn } from '@/lib/utils';
import { quoteRequestSchema, type QuoteRequestValues } from '@/schemas/forms';
import { ImagePicker, type PickedImage } from './image-picker';

interface Submitted {
  id: string;
  reference: string;
}

export function QuoteForm({
  services,
  settings,
  defaultServiceId,
  packageName,
}: {
  services: ServiceSummary[];
  settings: PublicSettings;
  defaultServiceId?: string;
  packageName?: string;
}) {
  const { data: me } = useMe();
  const [images, setImages] = React.useState<PickedImage[]>([]);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [submitted, setSubmitted] = React.useState<Submitted | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const links = getContactLinks(settings);

  const form = useForm<QuoteRequestValues>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      whatsapp: '',
      serviceId: defaultServiceId ?? '',
      location: '',
      propertyType: undefined,
      preferredContact: 'WHATSAPP',
      description: '',
      additionalNotes: packageName ? `Interested in the ${packageName} maintenance package.` : '',
      website: '',
    },
  });
  const { register, handleSubmit, formState, reset, getValues } = form;
  const { errors, isSubmitting } = formState;

  // Prefill from the signed-in customer's profile.
  React.useEffect(() => {
    if (!me || getValues('email')) return;
    reset({
      ...getValues(),
      firstName: me.firstName,
      lastName: me.lastName,
      email: me.email,
      phone: me.phone ?? '',
      whatsapp: me.whatsapp ?? '',
    });
  }, [me, reset, getValues]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const data = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === 'string' && value.trim() !== '') data.append(key, value.trim());
    }
    images.forEach((img) => data.append('images', img.file, img.file.name));
    try {
      setProgress(images.length ? 0 : null);
      const result = await uploadWithProgress<Submitted>('/quote-requests', data, images.length ? setProgress : undefined);
      setSubmitted(result);
      setImages([]);
      toast.success('Request received', { description: `Reference ${result.reference}` });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      const message = errorMessage(error);
      setServerError(message);
      toast.error('Could not submit your request', { description: message });
    } finally {
      setProgress(null);
    }
  });

  if (submitted) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-soft sm:p-12" role="status" aria-live="polite">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-9" aria-hidden />
        </span>
        <h2 className="mt-6 text-2xl font-extrabold">Thank you — we received your request</h2>
        <p className="mt-3 text-slate-600">
          Your reference number is <strong className="font-mono text-navy-900">{submitted.reference}</strong>. Our team will review the details and contact you
          shortly by your preferred method.
        </p>
        <p className="mt-2 text-sm text-slate-500">This is a request only — it is not a confirmed booking and no payment is taken online.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {me ? (
            <Button asChild variant="navy">
              <Link href={`/customer/requests/${submitted.id}`}>Track this request</Link>
            </Button>
          ) : (
            <Button asChild variant="navy">
              <Link href="/auth/register">Create an account to track requests</Link>
            </Button>
          )}
          <Button variant="outline" onClick={() => { setSubmitted(null); reset(); }}>
            Submit another request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8" aria-describedby="quote-form-note">
      <fieldset disabled={isSubmitting} className="space-y-8">
        <div>
          <legend className="text-lg font-bold text-navy-900">Your details</legend>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <FormField id="firstName" label="First name" required error={errors.firstName?.message}>
              <Input autoComplete="given-name" {...register('firstName')} />
            </FormField>
            <FormField id="lastName" label="Last name" required error={errors.lastName?.message}>
              <Input autoComplete="family-name" {...register('lastName')} />
            </FormField>
            <FormField id="email" label="Email" required error={errors.email?.message}>
              <Input type="email" autoComplete="email" inputMode="email" {...register('email')} />
            </FormField>
            <FormField id="phone" label="Phone" required error={errors.phone?.message} hint="e.g. +971 50 123 4567">
              <Input type="tel" autoComplete="tel" inputMode="tel" {...register('phone')} />
            </FormField>
            <FormField id="whatsapp" label="WhatsApp number" error={errors.whatsapp?.message} hint="Leave empty if same as phone">
              <Input type="tel" inputMode="tel" {...register('whatsapp')} />
            </FormField>
            <FormField id="preferredContact" label="Preferred contact method" required error={errors.preferredContact?.message}>
              <Select {...register('preferredContact')}>
                {CONTACT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {CONTACT_METHOD_LABELS[m]}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </div>

        <div>
          <legend className="text-lg font-bold text-navy-900">About the job</legend>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <FormField id="serviceId" label="Service" error={errors.serviceId?.message}>
              <Select {...register('serviceId')}>
                <option value="">Not sure / general enquiry</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField id="propertyType" label="Property type" required error={errors.propertyType?.message}>
              <Select defaultValue="" {...register('propertyType')}>
                <option value="" disabled>
                  Select property type
                </option>
                {PROPERTY_TYPES.map((p) => (
                  <option key={p} value={p}>
                    {PROPERTY_TYPE_LABELS[p]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField id="location" label="Location" required error={errors.location?.message} className="sm:col-span-2" hint="Area / community, e.g. Khalifa City, Abu Dhabi">
              <Input autoComplete="address-level2" {...register('location')} />
            </FormField>
            <FormField id="description" label="Problem description" required error={errors.description?.message} className="sm:col-span-2">
              <Textarea rows={5} placeholder="Describe the issue, when it started and anything we should know." {...register('description')} />
            </FormField>
            <FormField id="additionalNotes" label="Additional notes" error={errors.additionalNotes?.message} className="sm:col-span-2">
              <Textarea rows={3} placeholder="Access instructions, preferred times to call, etc." {...register('additionalNotes')} />
            </FormField>
          </div>
        </div>

        <div>
          <p className="text-lg font-bold text-navy-900">Photos (optional)</p>
          <p className="mt-1 text-sm text-slate-600">Photos help our team understand the job and prepare an accurate quotation.</p>
          <div className="mt-4">
            <ImagePicker value={images} onChange={setImages} max={MAX_QUOTE_IMAGES} onError={(m) => toast.error(m)} disabled={isSubmitting} />
          </div>
        </div>

        {/* Honeypot: hidden from people, filled by bots */}
        <div className="hidden" aria-hidden>
          <label htmlFor="website">Website</label>
          <input id="website" tabIndex={-1} autoComplete="off" {...register('website')} />
        </div>
      </fieldset>

      {progress !== null && (
        <div className="mt-6" aria-live="polite">
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>Uploading photos…</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
            <div className="h-full rounded-full bg-gold-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {serverError && (
        <p role="alert" className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
          {serverError}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p id="quote-form-note" className="max-w-md text-xs text-slate-500">
          By submitting you agree to our{' '}
          <Link href="/privacy-policy" className="underline">
            Privacy Policy
          </Link>
          . This is a quote request, not a booking — our team will contact you.
        </p>
        <Button type="submit" size="lg" loading={isSubmitting} className={cn('w-full sm:w-auto')}>
          <Send aria-hidden /> Submit request
        </Button>
      </div>
      {(links.whatsappHref || links.phoneHref) && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-surface p-4 text-sm text-slate-600">
          <span>Urgent? Reach us directly:</span>
          {links.whatsappHref && (
            <a href={links.whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-[#128C4B] hover:underline">
              <WhatsAppIcon className="size-4" /> WhatsApp
            </a>
          )}
          {links.phoneHref && (
            <a href={links.phoneHref} className="inline-flex items-center gap-1.5 font-semibold text-navy-700 hover:underline">
              <Phone className="size-4" aria-hidden /> {links.phoneDisplay}
            </a>
          )}
        </div>
      )}
    </form>
  );
}
