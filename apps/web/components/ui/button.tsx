import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-all duration-200 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-[1.1em] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-gold-500 text-navy-950 shadow-gold hover:-translate-y-0.5 hover:bg-gold-400 active:translate-y-0',
        navy: 'bg-navy-800 text-white shadow-soft hover:-translate-y-0.5 hover:bg-navy-700 active:translate-y-0',
        outline: 'border border-navy-200 bg-white text-navy-800 hover:border-navy-300 hover:bg-navy-50',
        'outline-light': 'border border-white/30 bg-white/5 text-white backdrop-blur hover:border-white/60 hover:bg-white/10',
        ghost: 'text-navy-800 hover:bg-navy-50',
        whatsapp: 'bg-[#25D366] text-white shadow-soft hover:-translate-y-0.5 hover:bg-[#1fbb59] active:translate-y-0',
        danger: 'bg-rose-600 text-white hover:bg-rose-700',
        link: 'h-auto px-0 text-navy-700 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3.5 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-13 px-7 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
          {children}
        </Slot>
      );
    }
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
