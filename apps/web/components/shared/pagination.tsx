'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Pagination({ page, totalPages, total, onPage }: { page: number; totalPages: number; total: number; onPage: (page: number) => void }) {
  if (total === 0) return null;
  return (
    <nav className="flex items-center justify-between gap-3 pt-4 text-sm text-slate-600" aria-label="Pagination">
      <span>
        Page <strong className="text-navy-900">{page}</strong> of {totalPages} · {total} total
      </span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft aria-hidden /> Prev
        </Button>
        <Button size="sm" variant="outline" onClick={() => onPage(page + 1)} disabled={page >= totalPages} aria-label="Next page">
          Next <ChevronRight aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
