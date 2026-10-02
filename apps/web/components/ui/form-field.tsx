import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactElement<{ id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }>;
}

/** Label + control + hint/error with correct ARIA wiring. */
export function FormField({ id, label, error, hint, required, className, children }: FormFieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="ml-0.5 text-rose-600" aria-hidden>
            *
          </span>
        )}
      </Label>
      {React.cloneElement(children, { id, 'aria-invalid': Boolean(error) || undefined, 'aria-describedby': describedBy })}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
