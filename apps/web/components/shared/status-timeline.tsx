import type { QuoteStatusHistoryEntry } from '@hikeup/types';
import { quoteStatusLabel } from '@/lib/status';
import { formatDateTime } from '@/lib/utils';

export function StatusTimeline({ history }: { history: QuoteStatusHistoryEntry[] }) {
  const items = [...history].reverse();
  return (
    <ol className="relative space-y-6 border-l-2 border-line pl-6">
      {items.map((h, i) => (
        <li key={h.id} className="relative">
          <span className={`absolute top-1 -left-[31px] size-4 rounded-full ring-4 ring-white ${i === 0 ? 'bg-gold-500' : 'bg-navy-200'}`} aria-hidden />
          <p className="font-semibold text-navy-900">{quoteStatusLabel(h.toStatus)}</p>
          <p className="text-xs text-slate-500">{formatDateTime(h.createdAt)}</p>
          {h.note && <p className="mt-1.5 rounded-xl bg-surface px-3 py-2 text-sm text-slate-700">{h.note}</p>}
        </li>
      ))}
    </ol>
  );
}
