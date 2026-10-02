import * as React from 'react';
import { cn } from '@/lib/utils';

export const inputClass =
  'block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-ink shadow-xs transition placeholder:text-slate-400 focus:border-navy-500 focus:ring-4 focus:ring-navy-100 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 aria-[invalid=true]:border-rose-400 aria-[invalid=true]:focus:ring-rose-100';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(inputClass, 'h-11', className)} {...props} />,
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, rows = 4, ...props }, ref) => <textarea ref={ref} rows={rows} className={cn(inputClass, 'min-h-24', className)} {...props} />,
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(inputClass, 'h-11 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27%2364748b%27%3E%3Cpath d=%27M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z%27/%3E%3C/svg%3E")] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10', className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = 'Select';
