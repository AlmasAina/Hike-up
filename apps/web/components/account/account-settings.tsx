'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Camera, KeyRound, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import type { AuthUser } from '@hikeup/types';
import { PasswordInput } from '@/components/auth/password-input';
import { validateImageFile } from '@/components/forms/image-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/feedback';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { ME_KEY, useMe } from '@/hooks/use-auth';
import { api, errorMessage, uploadWithProgress } from '@/lib/api-client';
import { initials } from '@/lib/utils';
import { changePasswordSchema, profileSchema, type ProfileValues } from '@/schemas/forms';

export function ProfileForm({ me }: { me: AuthUser }) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState, reset } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: me.firstName, lastName: me.lastName, phone: me.phone ?? '', whatsapp: me.whatsapp ?? '' },
  });
  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await api<AuthUser>('/account/profile', { method: 'PATCH', body: values });
      qc.setQueryData(ME_KEY, user);
      reset({ firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? '', whatsapp: user.whatsapp ?? '' });
      toast.success('Profile updated');
    } catch (e) {
      toast.error('Could not update profile', { description: errorMessage(e) });
    }
  });
  const { errors } = formState;
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <FormField id="firstName" label="First name" required error={errors.firstName?.message}>
        <Input {...register('firstName')} />
      </FormField>
      <FormField id="lastName" label="Last name" required error={errors.lastName?.message}>
        <Input {...register('lastName')} />
      </FormField>
      <FormField id="email" label="Email" hint="Contact us to change your email address">
        <Input value={me.email} disabled readOnly />
      </FormField>
      <FormField id="phone" label="Phone" error={errors.phone?.message}>
        <Input type="tel" {...register('phone')} />
      </FormField>
      <FormField id="whatsapp" label="WhatsApp" error={errors.whatsapp?.message}>
        <Input type="tel" {...register('whatsapp')} />
      </FormField>
      <div className="flex items-end">
        <Button type="submit" loading={formState.isSubmitting} disabled={!formState.isDirty}>
          <Save aria-hidden /> Save changes
        </Button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const { register, handleSubmit, formState, reset } = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    try {
      await api('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });
      reset();
      toast.success('Password changed', { description: 'Please sign in again with your new password.' });
      qc.setQueryData(ME_KEY, null);
      router.replace('/auth/login');
    } catch (e) {
      toast.error('Could not change password', { description: errorMessage(e) });
    }
  });
  const { errors } = formState;
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-3">
      <FormField id="currentPassword" label="Current password" required error={errors.currentPassword?.message}>
        <PasswordInput autoComplete="current-password" {...register('currentPassword')} />
      </FormField>
      <FormField id="newPassword" label="New password" required error={errors.newPassword?.message}>
        <PasswordInput autoComplete="new-password" {...register('newPassword')} />
      </FormField>
      <FormField id="confirmPassword" label="Confirm new password" required error={errors.confirmPassword?.message}>
        <PasswordInput autoComplete="new-password" {...register('confirmPassword')} />
      </FormField>
      <div className="sm:col-span-3">
        <Button type="submit" variant="navy" loading={formState.isSubmitting}>
          <KeyRound aria-hidden /> Change password
        </Button>
      </div>
    </form>
  );
}

export function AccountSettings({ title = 'Profile' }: { title?: string }) {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const onAvatar = async (file?: File) => {
    if (!file) return;
    const error = validateImageFile(file);
    if (error) return toast.error(error);
    const form = new FormData();
    form.append('file', file);
    setUploading(true);
    try {
      const user = await uploadWithProgress<AuthUser>('/account/avatar', form);
      qc.setQueryData(ME_KEY, user);
      toast.success('Profile photo updated');
    } catch (e) {
      toast.error('Upload failed', { description: errorMessage(e) });
    } finally {
      setUploading(false);
    }
  };

  if (!me) return <Skeleton className="h-96 rounded-3xl" />;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <Card>
        <CardContent className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="relative">
            {me.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- user uploaded avatar
              <img src={me.avatarUrl} alt="" className="size-20 rounded-full object-cover ring-4 ring-navy-50" />
            ) : (
              <span className="grid size-20 place-items-center rounded-full bg-navy-800 text-2xl font-bold text-gold-400">{initials(`${me.firstName} ${me.lastName}`)}</span>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -right-1 -bottom-1 grid size-8 place-items-center rounded-full bg-gold-500 text-navy-950 shadow ring-2 ring-white"
              aria-label="Change profile photo"
            >
              <Camera className="size-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onAvatar(e.target.files?.[0])} />
          </div>
          <div>
            <p className="text-xl font-bold text-navy-900">
              {me.firstName} {me.lastName}
            </p>
            <p className="text-slate-500">{me.email}</p>
            <p className="mt-1 text-xs text-slate-400">{me.emailVerified ? 'Email verified' : 'Email not verified'}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm me={me} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
