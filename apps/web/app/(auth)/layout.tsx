import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { LogoFull, LogoLockup } from '@/components/brand/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <aside className="relative hidden overflow-hidden bg-hero p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Link href="/" className="relative w-fit" aria-label="Back to home">
          <LogoFull tone="light" className="w-40" priority />
        </Link>
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl leading-tight font-extrabold text-white">Your maintenance requests, all in one place.</h2>
          <ul className="mt-8 space-y-4 text-navy-100">
            {['Track the status of every quote and service request', 'Message our team and share extra photos', 'Keep a history of work at your property'].map((t) => (
              <li key={t} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold-400" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-navy-300">No online booking or payment — our team always confirms details with you directly.</p>
      </aside>
      <main id="main" className="flex flex-col bg-surface">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8 lg:hidden">
          <LogoLockup />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <p className="pb-6 text-center text-sm text-slate-500">
          <Link href="/" className="hover:text-navy-800">
            ← Back to website
          </Link>
        </p>
      </main>
    </div>
  );
}
