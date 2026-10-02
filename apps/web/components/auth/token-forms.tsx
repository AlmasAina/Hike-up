'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, MailCheck, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/feedback';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { api, errorMessage } from '@/lib/api-client';
import { forgotPasswordSchema, resetPasswordSchema } from '@/schemas/forms';
import { PasswordInput } from './password-input';

export function ForgotPasswordForm() {
  const [sent, setSent] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await api('/auth/forgot-password', { method: 'POST', body: values });
      setSent(true);
    } catch (error) {
      setServerError(errorMessage(error));
    }
  });

  if (sent) {
    return (
      <div className="text-center" role="status">
        <MailCheck className="mx-auto size-12 text-emerald-600" aria-hidden />
        <p className="mt-4 text-slate-700">If an account exists for that email, we have sent a link to reset your password. The link expires in 1 hour.</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/auth/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormField id="email" label="Email" required error={formState.errors.email?.message}>
        <Input type="email" autoComplete="email" {...register('email')} />
      </FormField>
      {serverError && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
          {serverError}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" loading={formState.isSubmitting}>
        Send reset link
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? '';
  const [done, setDone] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    setServerError(null);
    try {
      await api('/auth/reset-password', { method: 'POST', body: { token, password } });
      setDone(true);
    } catch (error) {
      setServerError(errorMessage(error));
    }
  });

  if (!token) {
    return (
      <div className="text-center" role="alert">
        <XCircle className="mx-auto size-12 text-rose-500" aria-hidden />
        <p className="mt-4 text-slate-700">This reset link is missing its token. Please request a new link.</p>
        <Button asChild className="mt-6">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center" role="status">
        <CheckCircle2 className="mx-auto size-12 text-emerald-600" aria-hidden />
        <p className="mt-4 text-slate-700">Your password has been updated. You can now sign in with your new password.</p>
        <Button asChild className="mt-6">
          <Link href="/auth/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormField id="password" label="New password" required error={formState.errors.password?.message} hint="At least 8 characters with a letter and a number">
        <PasswordInput autoComplete="new-password" {...register('password')} />
      </FormField>
      <FormField id="confirmPassword" label="Confirm new password" required error={formState.errors.confirmPassword?.message}>
        <PasswordInput autoComplete="new-password" {...register('confirmPassword')} />
      </FormField>
      {serverError && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
          {serverError}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" loading={formState.isSubmitting}>
        Update password
      </Button>
    </form>
  );
}

export function VerifyEmail() {
  const token = useSearchParams().get('token') ?? '';
  const [state, setState] = React.useState<'loading' | 'ok' | 'error'>(token ? 'loading' : 'error');
  const [message, setMessage] = React.useState('This verification link is invalid.');
  const ran = React.useRef(false);

  React.useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true;
    api('/auth/verify-email', { method: 'POST', body: { token } })
      .then(() => setState('ok'))
      .catch((error) => {
        setMessage(errorMessage(error));
        setState('error');
      });
  }, [token]);

  if (state === 'loading') return <Spinner label="Verifying your email" />;
  return (
    <div className="text-center" role={state === 'ok' ? 'status' : 'alert'}>
      {state === 'ok' ? <CheckCircle2 className="mx-auto size-12 text-emerald-600" aria-hidden /> : <XCircle className="mx-auto size-12 text-rose-500" aria-hidden />}
      <p className="mt-4 text-slate-700">{state === 'ok' ? 'Thank you — your email address is verified.' : message}</p>
      <Button asChild className="mt-6">
        <Link href="/customer/dashboard">Go to my dashboard</Link>
      </Button>
    </div>
  );
}
