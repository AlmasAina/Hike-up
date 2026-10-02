'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { toast } from 'sonner';
import type { QuoteStatus, RequestMessage } from '@hikeup/types';
import { MessageThread } from '@/components/shared/message-thread';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { api, errorMessage } from '@/lib/api-client';
import { cn, formatDateTime } from '@/lib/utils';

interface Thread {
  requestId: string;
  reference: string;
  status: QuoteStatus;
  service: string;
  lastMessage: { body: string; createdAt: string; fromStaff: boolean } | null;
  unread: number;
}

function MessagesInner() {
  const params = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const threads = useQuery({ queryKey: ['customer', 'threads'], queryFn: () => api<Thread[]>('/customer/messages'), refetchInterval: 30_000 });
  const selected = params.get('request') ?? threads.data?.[0]?.requestId ?? null;
  const messages = useQuery({
    queryKey: ['customer', 'messages', selected],
    enabled: Boolean(selected),
    queryFn: async () => {
      const result = await api<RequestMessage[]>(`/customer/quote-requests/${selected}/messages`);
      void qc.invalidateQueries({ queryKey: ['customer', 'threads'] });
      return result;
    },
    refetchInterval: 30_000,
  });
  const send = useMutation({
    mutationFn: (body: string) => api(`/customer/quote-requests/${selected}/messages`, { method: 'POST', body: { body } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['customer', 'messages', selected] });
      void qc.invalidateQueries({ queryKey: ['customer', 'threads'] });
    },
    onError: (e) => toast.error('Message not sent', { description: errorMessage(e) }),
  });

  if (threads.isError) return <ErrorState description="We could not load your messages." onRetry={() => threads.refetch()} />;
  if (threads.isLoading) return <Skeleton className="h-96 rounded-3xl" />;
  if (!threads.data?.length)
    return <EmptyState icon={MessageSquare} title="No conversations yet" description="Messages are linked to your requests. Submit a request to start a conversation with our team." />;

  const current = threads.data.find((t) => t.requestId === selected);
  return (
    <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <ul className="divide-y divide-line">
          {threads.data.map((t) => (
            <li key={t.requestId}>
              <button
                onClick={() => router.replace(`/customer/messages?request=${t.requestId}`, { scroll: false })}
                className={cn('flex w-full flex-col items-start gap-1 px-5 py-4 text-left transition hover:bg-surface', t.requestId === selected && 'bg-navy-50')}
                aria-current={t.requestId === selected ? 'true' : undefined}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-navy-800">{t.reference}</span>
                  {t.unread > 0 && <span className="rounded-full bg-gold-500 px-2 text-xs font-bold text-navy-950">{t.unread}</span>}
                </span>
                <span className="text-sm font-semibold text-navy-900">{t.service}</span>
                <span className="line-clamp-1 text-xs text-slate-500">{t.lastMessage ? `${t.lastMessage.fromStaff ? 'Team: ' : 'You: '}${t.lastMessage.body}` : 'No messages yet'}</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>{current ? `${current.reference} · ${current.service}` : 'Conversation'}</CardTitle>
            {current?.lastMessage && <p className="text-xs text-slate-500">Last message {formatDateTime(current.lastMessage.createdAt)}</p>}
          </div>
          {current && (
            <div className="flex items-center gap-3">
              <StatusBadge status={current.status} />
              <Link href={`/customer/requests/${current.requestId}`} className="text-sm font-semibold text-navy-700 hover:underline">
                View request
              </Link>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {messages.isLoading ? <Skeleton className="h-60" /> : <MessageThread messages={messages.data ?? []} perspective="customer" onSend={(b) => send.mutateAsync(b)} sending={send.isPending} />}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CustomerMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Messages</h1>
        <p className="mt-1 text-slate-600">Conversations with our team about your requests. For urgent issues, call or WhatsApp us.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 rounded-3xl" />}>
        <MessagesInner />
      </Suspense>
    </div>
  );
}
