import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { LogoFull } from '@/components/brand/logo';

export const metadata: Metadata = { title: 'Admin sign in', robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <main id="main" className="relative grid min-h-dvh place-items-center overflow-hidden bg-hero px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <LogoFull tone="light" className="w-36" priority />
        </div>
        <div className="rounded-3xl bg-white p-8 shadow-lift">
          <h1 className="text-2xl font-extrabold">Admin sign in</h1>
          <p className="mt-1 text-sm text-slate-600">Back-office access for administrators and staff.</p>
          <div className="mt-6">
            <Suspense>
              <LoginForm variant="admin" />
            </Suspense>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-navy-200">Access is monitored and recorded in the audit log.</p>
      </div>
    </main>
  );
}
