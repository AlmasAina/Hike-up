import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = { title: 'Create an account', robots: { index: false } };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Track requests, message our team and keep your maintenance history in one place."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-navy-700 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
