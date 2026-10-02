'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AuthResponse } from '@hikeup/types';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { ME_KEY } from '@/hooks/use-auth';
import { api, errorMessage } from '@/lib/api-client';
import { compact, registerSchema, type RegisterValues } from '@/schemas/forms';
import { PasswordInput } from './password-input';

export function RegisterForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', whatsapp: '', password: '', confirmPassword: '' },
  });
  const { errors, isSubmitting } = formState;

  const onSubmit = handleSubmit(async ({ confirmPassword: _c, acceptTerms: _a, ...values }) => {
    setServerError(null);
    try {
      const result = await api<AuthResponse>('/auth/register', { method: 'POST', body: compact(values) });
      qc.setQueryData(ME_KEY, result.user);
      toast.success('Account created', { description: 'Please check your email to verify your address.' });
      router.replace('/customer/dashboard');
      router.refresh();
    } catch (error) {
      setServerError(errorMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="firstName" label="First name" required error={errors.firstName?.message}>
          <Input autoComplete="given-name" {...register('firstName')} />
        </FormField>
        <FormField id="lastName" label="Last name" required error={errors.lastName?.message}>
          <Input autoComplete="family-name" {...register('lastName')} />
        </FormField>
      </div>
      <FormField id="email" label="Email" required error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register('email')} />
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="phone" label="Phone" required error={errors.phone?.message}>
          <Input type="tel" autoComplete="tel" {...register('phone')} />
        </FormField>
        <FormField id="whatsapp" label="WhatsApp" error={errors.whatsapp?.message}>
          <Input type="tel" {...register('whatsapp')} />
        </FormField>
      </div>
      <FormField id="password" label="Password" required error={errors.password?.message} hint="At least 8 characters with a letter and a number">
        <PasswordInput autoComplete="new-password" {...register('password')} />
      </FormField>
      <FormField id="confirmPassword" label="Confirm password" required error={errors.confirmPassword?.message}>
        <PasswordInput autoComplete="new-password" {...register('confirmPassword')} />
      </FormField>
      <div>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input type="checkbox" className="mt-0.5 size-4 rounded border-slate-300 accent-navy-700" {...register('acceptTerms')} />
          <span>
            I agree to the{' '}
            <Link href="/terms-and-conditions" className="font-semibold text-navy-700 underline" target="_blank">
              Terms &amp; Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="font-semibold text-navy-700 underline" target="_blank">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.acceptTerms && (
          <p role="alert" className="mt-1 text-xs font-medium text-rose-600">
            {errors.acceptTerms.message}
          </p>
        )}
      </div>
      {serverError && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
          {serverError}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
        <UserPlus aria-hidden /> Create account
      </Button>
    </form>
  );
}
