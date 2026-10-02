import { ArrowLeft, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function StatusPage({
  code,
  title,
  description,
  Icon,
  action,
}: {
  code: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-hero text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div className="container-page relative flex min-h-[70dvh] flex-col items-center justify-center py-20 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-gold-500 text-navy-950 shadow-gold">
          <Icon className="size-8" aria-hidden />
        </span>
        <p className="mt-8 font-display text-7xl font-extrabold text-white/15 sm:text-8xl">{code}</p>
        <h1 className="-mt-6 text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-lg text-lg text-navy-100">{description}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {action}
          <Button asChild variant="outline-light" size="lg">
            <Link href="/">
              <ArrowLeft aria-hidden /> Back to home
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
