'use client';

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';

/**
 * Presentation helper for repeatable rows (features, FAQs, value cards …).
 * Works with react-hook-form's useFieldArray (pass fields + move/remove/append).
 */
export function FieldList<T extends { id: string }>({
  fields,
  render,
  onAdd,
  onRemove,
  onMove,
  addLabel,
  emptyText = 'No items yet.',
}: {
  fields: T[];
  render: (field: T, index: number) => React.ReactNode;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  addLabel: string;
  emptyText?: string;
}) {
  return (
    <div className="space-y-3">
      {fields.length === 0 && <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">{emptyText}</p>}
      {fields.map((field, i) => (
        <div key={field.id} className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <div className="min-w-0 flex-1 space-y-2">{render(field, i)}</div>
          <div className="flex flex-col gap-1">
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2" disabled={i === 0} onClick={() => onMove(i, i - 1)} aria-label="Move up">
              <ArrowUp aria-hidden />
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2" disabled={i === fields.length - 1} onClick={() => onMove(i, i + 1)} aria-label="Move down">
              <ArrowDown aria-hidden />
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-rose-600" onClick={() => onRemove(i)} aria-label="Remove">
              <Trash2 aria-hidden />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={onAdd}>
        <Plus aria-hidden /> {addLabel}
      </Button>
    </div>
  );
}
