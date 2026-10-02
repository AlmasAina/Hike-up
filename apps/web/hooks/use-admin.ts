'use client';

import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';
import type { Paginated } from '@hikeup/types';
import { revalidatePublicSite } from '@/app/actions/revalidate';
import { api, errorMessage } from '@/lib/api-client';
import { useDebounced } from './use-debounced';

/** Paginated admin list with search, filters and date ordering. */
export function useAdminList<T>(resource: string, initialFilters: Record<string, string> = {}, pageSize = 20) {
  const params = useSearchParams();
  const [page, setPage] = React.useState(1);
  const [search, setSearchRaw] = React.useState(params.get('search') ?? '');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = React.useState<Record<string, string>>(initialFilters);
  const debounced = useDebounced(search, 350);

  const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize), order });
  if (debounced) qs.set('search', debounced);
  Object.entries(filters).forEach(([k, v]) => v && qs.set(k, v));

  const query = useQuery({
    queryKey: ['admin', resource, qs.toString()],
    queryFn: () => api<Paginated<T>>(`/admin/${resource}?${qs}`),
    placeholderData: (prev) => prev,
  });

  return {
    query,
    page,
    setPage,
    search,
    setSearch: (v: string) => {
      setSearchRaw(v);
      setPage(1);
    },
    order,
    toggleOrder: () => setOrder((o) => (o === 'asc' ? 'desc' : 'asc')),
    filters,
    setFilter: (key: string, value: string) => {
      setFilters((f) => ({ ...f, [key]: value }));
      setPage(1);
    },
  };
}

/**
 * Mutation helper for admin edits: toasts success/error, invalidates admin caches and refreshes the
 * public website (ISR) when content changed.
 */
export function useAdminMutation<TVars, TResult = unknown>(
  fn: (vars: TVars) => Promise<TResult>,
  options: { success?: string; invalidate?: QueryKey[]; revalidateSite?: boolean; onSuccess?: (result: TResult, vars: TVars) => void } = {},
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async (result, vars) => {
      if (options.success) toast.success(options.success);
      await Promise.all((options.invalidate ?? [['admin']]).map((key) => qc.invalidateQueries({ queryKey: key })));
      if (options.revalidateSite !== false) void revalidatePublicSite();
      options.onSuccess?.(result, vars);
    },
    onError: (error) => toast.error('Action failed', { description: errorMessage(error) }),
  });
}
