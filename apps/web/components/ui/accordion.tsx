'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({ className, ...props }: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn('rounded-2xl border border-line bg-white transition-shadow data-[state=open]:shadow-soft', className)}
      {...props}
    />
  );
}

export function AccordionTrigger({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'group flex flex-1 items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left font-semibold text-navy-900 transition hover:text-navy-700 sm:px-6',
          className,
        )}
        {...props}
      >
        {children}
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-50 text-navy-700 transition group-data-[state=open]:rotate-45 group-data-[state=open]:bg-gold-500 group-data-[state=open]:text-navy-950">
          <Plus className="size-4" aria-hidden />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content className="overflow-hidden" {...props}>
      <div className={cn('px-5 pb-5 leading-relaxed text-slate-600 sm:px-6', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}
