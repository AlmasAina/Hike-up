'use client';

import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import * as React from 'react';
import { cn } from '@/lib/utils';

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuLabel = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Label>) => (
  <DropdownPrimitive.Label className={cn('px-3 py-2 text-xs font-semibold text-slate-500', className)} {...props} />
);
export const DropdownMenuSeparator = () => <DropdownPrimitive.Separator className="my-1 h-px bg-line" />;

export function DropdownMenuContent({ className, align = 'end', ...props }: React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        align={align}
        sideOffset={8}
        className={cn('z-50 min-w-48 rounded-xl border border-line bg-white p-1 shadow-lift', className)}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }: React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none data-[highlighted]:bg-navy-50 data-[highlighted]:text-navy-900 [&_svg]:size-4',
        className,
      )}
      {...props}
    />
  );
}
