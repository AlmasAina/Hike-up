'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-slate-300 transition data-[state=checked]:bg-navy-700 disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="block size-5 rounded-full bg-white shadow transition data-[state=checked]:translate-x-5" />
  </SwitchPrimitive.Root>
));
Switch.displayName = 'Switch';
