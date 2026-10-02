import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', {
  variants: {
    variant: {
      neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
      navy: 'bg-navy-50 text-navy-700 ring-navy-200',
      gold: 'bg-gold-50 text-gold-700 ring-gold-200',
      success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      danger: 'bg-rose-50 text-rose-700 ring-rose-200',
      warning: 'bg-amber-50 text-amber-800 ring-amber-200',
    },
  },
  defaultVariants: { variant: 'neutral' },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
