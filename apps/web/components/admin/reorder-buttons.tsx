'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';

export function ReorderButtons({ index, count, onMove }: { index: number; count: number; onMove: (from: number, to: number) => void }) {
  return (
    <span className="inline-flex gap-0.5" onClick={(e) => e.stopPropagation()}>
      <button type="button" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-navy-800 disabled:opacity-30" disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label="Move up">
        <ArrowUp className="size-4" />
      </button>
      <button type="button" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-navy-800 disabled:opacity-30" disabled={index === count - 1} onClick={() => onMove(index, index + 1)} aria-label="Move down">
        <ArrowDown className="size-4" />
      </button>
    </span>
  );
}

export function moveId(ids: string[], from: number, to: number): string[] {
  const next = [...ids];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
