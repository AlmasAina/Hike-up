'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import type { Notification } from '@hikeup/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api-client';
import { cn, formatDateTime } from '@/lib/utils';

const KEY = ['notifications'];

/** Dashboard notification centre (polls every 60 s). */
export function NotificationsBell({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: KEY,
    queryFn: () => api<{ items: Notification[]; unread: number }>('/notifications'),
    refetchInterval: 60_000,
  });
  const markAll = useMutation({ mutationFn: () => api('/notifications/read-all', { method: 'POST', body: {} }), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
  const markOne = useMutation({ mutationFn: (id: string) => api(`/notifications/${id}/read`, { method: 'PATCH', body: {} }), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
  const unread = data?.unread ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn('relative grid size-10 place-items-center rounded-xl transition', tone === 'dark' ? 'text-navy-100 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100')}
          aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
        >
          <Bell className="size-5" aria-hidden />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] leading-4 font-bold text-white">{unread > 9 ? '9+' : unread}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-sm font-bold text-navy-900">Notifications</p>
          {unread > 0 && (
            <button onClick={() => markAll.mutate()} className="flex items-center gap-1 text-xs font-semibold text-navy-700 hover:underline">
              <CheckCheck className="size-3.5" aria-hidden /> Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto p-1">
          {!data?.items.length && <p className="px-4 py-8 text-center text-sm text-slate-500">You&apos;re all caught up.</p>}
          {data?.items.map((n) => (
            <DropdownMenuItem key={n.id} asChild onSelect={() => !n.readAt && markOne.mutate(n.id)}>
              <Link href={n.link ?? '#'} className={cn('flex-col items-start gap-0.5', !n.readAt && 'bg-navy-50/60')}>
                <span className="flex w-full items-start gap-2">
                  {!n.readAt && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gold-500" aria-label="Unread" />}
                  <span className="text-sm font-semibold text-navy-900">{n.title}</span>
                </span>
                {n.body && <span className="line-clamp-2 text-xs text-slate-600">{n.body}</span>}
                <span className="text-[11px] text-slate-400">{formatDateTime(n.createdAt)}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
