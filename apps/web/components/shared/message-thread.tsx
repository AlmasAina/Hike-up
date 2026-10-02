'use client';

import { Send } from 'lucide-react';
import * as React from 'react';
import type { RequestMessage } from '@hikeup/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { cn, formatDateTime } from '@/lib/utils';

/**
 * Conversation view used by both the customer portal and the admin request page.
 * `perspective` decides which side is "mine".
 */
export function MessageThread({
  messages,
  perspective,
  onSend,
  sending,
  disabledReason,
}: {
  messages: RequestMessage[];
  perspective: 'customer' | 'staff';
  onSend: (body: string) => Promise<unknown>;
  sending?: boolean;
  disabledReason?: string;
}) {
  const [body, setBody] = React.useState('');
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    await onSend(text);
    setBody('');
  };

  return (
    <div className="flex flex-col">
      <div className="max-h-[28rem] min-h-40 space-y-4 overflow-y-auto rounded-2xl bg-surface p-4" aria-live="polite">
        {messages.length === 0 && <p className="py-10 text-center text-sm text-slate-500">No messages yet.</p>}
        {messages.map((m) => {
          const mine = perspective === 'staff' ? m.fromStaff : !m.fromStaff;
          return (
            <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm', mine ? 'rounded-br-md bg-navy-800 text-white' : 'rounded-bl-md bg-white text-slate-800 ring-1 ring-line')}>
                <p className={cn('text-xs font-semibold', mine ? 'text-gold-300' : 'text-navy-700')}>{m.senderName}</p>
                <p className="mt-1 leading-relaxed whitespace-pre-line">{m.body}</p>
                <p className={cn('mt-1.5 text-[11px]', mine ? 'text-navy-200' : 'text-slate-400')}>{formatDateTime(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      {disabledReason ? (
        <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">{disabledReason}</p>
      ) : (
        <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <label htmlFor="message-body" className="sr-only">
            Message
          </label>
          <Textarea
            id="message-body"
            rows={2}
            value={body}
            maxLength={5000}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a message…"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void submit(e);
            }}
          />
          <Button type="submit" loading={sending} disabled={!body.trim()} className="sm:h-[68px]">
            <Send aria-hidden /> Send
          </Button>
        </form>
      )}
    </div>
  );
}
