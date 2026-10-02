'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { isBackOffice, useLogin } from '@/hooks/use-auth';
import { errorMessage } from '@/lib/api-client';
import { safeRedirect } from '@/lib/utils';
import { loginSchema, type LoginValues } from '@/schemas/forms';
import { PasswordInput } from './password-input';

/** Shared by /auth/login (customers) and /admin/login (back office). */
export function LoginForm({ variant = 'customer' }: { variant?: 'customer' | 'admin' }) {
  const router = useRouter();
  const params = useSearchParams();
  const login = useLogin();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const { user } = await login.mutateAsync(values);
      const backOffice = isBackOffice(user);
      if (variant === 'admin' && !backOffice) {
        toast.message('Signed in to your customer account');
        router.replace('/customer/dashboard');
        return;
      }
      const fallback = backOffice ? '/admin/dashboard' : '/customer/dashboard';
      let next = safeRedirect(params.get('next'), fallback);
      // Customers can't open admin pages and staff land in the admin panel.
      if (!backOffice && next.startsWith('/admin')) next = '/customer/dashboard';
      toast.success(`Welcome back, ${user.firstName}`);
      router.replace(next);
      router.refresh();
    } catch (error) {
      setServerError(errorMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormField id="email" label="Email" required error={formState.errors.email?.message}>
        <Input type="email" autoComplete="email" inputMode="email" {...register('email')} />
      </FormField>
      <FormField id="password" label="Password" required error={formState.errors.password?.message}>
        <PasswordInput autoComplete="current-password" {...register('password')} />
      </FormField>
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-semibold text-navy-700 hover:underline">
          Forgot password?
        </Link>
      </div>
      {serverError && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
          {serverError}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" variant={variant === 'admin' ? 'navy' : 'primary'} loading={formState.isSubmitting}>
        <LogIn aria-hidden /> Sign in
      </Button>
    </form>
  );
}
