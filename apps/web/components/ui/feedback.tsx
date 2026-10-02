import { Inbox, Loader2, type LucideIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <span role="status" className={cn('inline-flex items-center gap-2 text-sm text-slate-500', className)}>
      <Loader2 className="size-5 animate-spin text-navy-600" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4', className)} aria-hidden />;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-surface px-6 py-12 text-center', className)}>
      <span className="grid size-12 place-items-center rounded-full bg-white text-navy-600 shadow-soft">
        <Icon className="size-6" aria-hidden />
      </span>
      <h3 className="mt-4 text-base font-bold">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-slate-600">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', description, onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
      <h3 className="text-base font-bold text-rose-800">{title}</h3>
      {description && <p className="mt-1 text-sm text-rose-700">{description}</p>}
      {onRetry && (
        <button onClick={onRetry} className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">
          Try again
        </button>
      )}
    </div>
  );
}
