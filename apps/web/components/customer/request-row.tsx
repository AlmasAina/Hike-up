import { ChevronRight, ImageIcon, MapPin } from 'lucide-react';
import Link from 'next/link';
import { REQUEST_TYPE_LABELS, type CustomerQuoteRequest } from '@hikeup/types';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate } from '@/lib/utils';

export function RequestRow({ request }: { request: CustomerQuoteRequest }) {
  return (
    <Link
      href={`/customer/requests/${request.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-bold text-navy-800">{request.reference}</span>
          <StatusBadge status={request.status} />
        </div>
        <p className="mt-1.5 font-semibold text-navy-900">
          {request.service?.title ?? 'General enquiry'} <span className="font-normal text-slate-500">· {REQUEST_TYPE_LABELS[request.type]}</span>
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden /> {request.location}
          </span>
          {request.images.length > 0 && (
            <span className="flex items-center gap-1">
              <ImageIcon className="size-3.5" aria-hidden /> {request.images.length} photo{request.images.length > 1 ? 's' : ''}
            </span>
          )}
          <span>Submitted {formatDate(request.createdAt)}</span>
        </p>
      </div>
      <ChevronRight className="hidden size-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-navy-700 sm:block" aria-hidden />
    </Link>
  );
}
