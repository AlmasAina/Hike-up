import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import { ResetPasswordForm } from '@/components/auth/token-forms';

export const metadata: Metadata = { title: 'Reset password', robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Choose a new password" subtitle="For your security, all other sessions will be signed out.">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
