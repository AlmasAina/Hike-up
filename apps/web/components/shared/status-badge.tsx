import type { QuoteStatus } from '@hikeup/types';
import { QUOTE_STATUS_STYLES, quoteStatusLabel } from '@/lib/status';
import { cn } from '@/lib/utils';

export function StatusBadge({ status, className }: { status: QuoteStatus; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ring-1 ring-inset', QUOTE_STATUS_STYLES[status], className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {quoteStatusLabel(status)}
    </span>
  );
}
