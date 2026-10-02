'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Send } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input, Textarea } from '@/components/ui/input';
import { api, errorMessage } from '@/lib/api-client';
import { compact, contactSchema, type ContactValues } from '@/schemas/forms';

export function ContactForm() {
  const [sent, setSent] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const { register, handleSubmit, formState, reset } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '', website: '' },
  });
  const { errors, isSubmitting } = formState;

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await api('/contact', { method: 'POST', body: compact(values) });
      setSent(true);
      reset();
      toast.success('Message sent', { description: 'Thank you — our team will get back to you shortly.' });
    } catch (error) {
      const message = errorMessage(error);
      setServerError(message);
      toast.error('Message not sent', { description: message });
    }
  });

  if (sent) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-soft" role="status">
        <CheckCircle2 className="mx-auto size-12 text-emerald-600" aria-hidden />
        <h3 className="mt-4 text-xl font-bold">Thank you for your message</h3>
        <p className="mt-2 text-slate-600">We have received your message and will reply as soon as possible.</p>
        <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8">
      <h3 className="text-xl font-bold">Send us a message</h3>
      <fieldset disabled={isSubmitting} className="mt-6 grid gap-5 sm:grid-cols-2">
        <FormField id="contact-name" label="Name" required error={errors.name?.message}>
          <Input autoComplete="name" {...register('name')} />
        </FormField>
        <FormField id="contact-email" label="Email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register('email')} />
        </FormField>
        <FormField id="contact-phone" label="Phone" error={errors.phone?.message}>
          <Input type="tel" autoComplete="tel" {...register('phone')} />
        </FormField>
        <FormField id="contact-subject" label="Subject" required error={errors.subject?.message}>
          <Input {...register('subject')} />
        </FormField>
        <FormField id="contact-message" label="Message" required error={errors.message?.message} className="sm:col-span-2">
          <Textarea rows={5} {...register('message')} />
        </FormField>
        <div className="hidden" aria-hidden>
          <input tabIndex={-1} autoComplete="off" {...register('website')} />
        </div>
      </fieldset>
      {serverError && (
        <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
          {serverError}
        </p>
      )}
      <Button type="submit" size="lg" loading={isSubmitting} className="mt-6 w-full sm:w-auto">
        <Send aria-hidden /> Send message
      </Button>
    </form>
  );
}
