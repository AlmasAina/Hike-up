import { QUOTE_STATUS_LABELS, type QuoteStatus } from '@hikeup/types';

export const QUOTE_STATUS_STYLES: Record<QuoteStatus, string> = {
  NEW: 'bg-sky-50 text-sky-700 ring-sky-200',
  CONTACTED: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-800 ring-amber-200',
  QUOTED: 'bg-violet-50 text-violet-700 ring-violet-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 ring-rose-200',
  COMPLETED: 'bg-green-100 text-green-800 ring-green-300',
};

export function quoteStatusLabel(status: QuoteStatus): string {
  return QUOTE_STATUS_LABELS[status];
}
