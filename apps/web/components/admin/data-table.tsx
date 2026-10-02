'use client';

import { ArrowDownWideNarrow, ArrowUpNarrowWide, Search } from 'lucide-react';
import * as React from 'react';
import { Pagination } from '@/components/shared/pagination';
import { EmptyState, ErrorState } from '@/components/ui/feedback';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  /** Show this column on small screens (others collapse) */
  primary?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  search?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  page?: number;
  totalPages?: number;
  total?: number;
  onPage?: (page: number) => void;
  order?: 'asc' | 'desc';
  onToggleOrder?: () => void;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

/** Generic admin table: search, filters, sort (by date), pagination, loading/empty/error states. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  onRetry,
  search,
  onSearch,
  searchPlaceholder = 'Search…',
  filters,
  page,
  totalPages,
  total,
  onPage,
  order,
  onToggleOrder,
  onRowClick,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
}: DataTableProps<T>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {(onSearch || filters || onToggleOrder) && (
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center">
          {onSearch && (
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <Input className="h-10 pl-10" placeholder={searchPlaceholder} aria-label={searchPlaceholder} value={search ?? ''} onChange={(e) => onSearch(e.target.value)} type="search" />
            </div>
          )}
          {filters && <div className="flex flex-wrap gap-2 [&_select]:h-10 [&_select]:w-auto [&_input]:h-10">{filters}</div>}
          {onToggleOrder && (
            <button
              onClick={onToggleOrder}
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              aria-label={`Sort ${order === 'asc' ? 'oldest first' : 'newest first'}`}
            >
              {order === 'asc' ? <ArrowUpNarrowWide className="size-4" /> : <ArrowDownWideNarrow className="size-4" />}
              {order === 'asc' ? 'Oldest first' : 'Newest first'}
            </button>
          )}
        </div>
      )}
      {error ? (
        <div className="p-4">
          <ErrorState description="Could not load data." onRetry={onRetry} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} scope="col" className={cn('px-4 py-3 whitespace-nowrap', !c.primary && 'hidden md:table-cell', c.className)}>
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading &&
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={`s${i}`}>
                    {columns.map((c) => (
                      <td key={c.key} className={cn('px-4 py-4', !c.primary && 'hidden md:table-cell')}>
                        <div className="skeleton h-4 w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))}
              {!loading &&
                rows?.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn('align-middle transition', onRowClick && 'cursor-pointer hover:bg-navy-50/50')}
                  >
                    {columns.map((c) => (
                      <td key={c.key} className={cn('px-4 py-3.5', !c.primary && 'hidden md:table-cell', c.className)}>
                        {c.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
          {!loading && rows && rows.length === 0 && (
            <div className="p-4">
              <EmptyState title={emptyTitle} description={emptyDescription} />
            </div>
          )}
        </div>
      )}
      {onPage && page && totalPages && total !== undefined && total > 0 && (
        <div className="border-t border-slate-200 px-4 pb-4">
          <Pagination page={page} totalPages={totalPages} total={total} onPage={onPage} />
        </div>
      )}
    </div>
  );
}
