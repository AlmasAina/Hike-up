'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DynamicIcon, ICON_NAMES } from '@/lib/icons';
import { cn } from '@/lib/utils';
import * as React from 'react';

export function IconPicker({ value, onChange, id }: { value?: string | null; onChange: (name: string) => void; id?: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          id={id}
          type="button"
          className="flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:border-navy-400"
        >
          <span className="grid size-7 place-items-center rounded-lg bg-navy-800 text-gold-400">
            <DynamicIcon name={value} className="size-4" />
          </span>
          {value || 'Choose icon'}
        </button>
      </DialogTrigger>
      <DialogContent title="Choose an icon" className="max-w-xl">
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {ICON_NAMES.map((name) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
                className={cn('flex w-full flex-col items-center gap-1 rounded-xl p-2 text-[10px] text-slate-600 ring-1 ring-slate-200 hover:bg-navy-50', value === name && 'bg-navy-800 text-white ring-navy-800')}
                aria-pressed={value === name}
              >
                <DynamicIcon name={name} className="size-5" />
                <span className="w-full truncate">{name}</span>
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
