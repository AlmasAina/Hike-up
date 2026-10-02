'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';
import {
  CONTACT_METHOD_LABELS,
  MAX_QUOTE_IMAGES,
  PROPERTY_TYPE_LABELS,
  REQUEST_TYPE_LABELS,
  type CustomerQuoteRequest,
  type RequestMessage,
} from '@hikeup/types';
import { ImagePicker, type PickedImage } from '@/components/forms/image-picker';
import { MessageThread } from '@/components/shared/message-thread';
import { StatusBadge } from '@/components/shared/status-badge';
import { StatusTimeline } from '@/components/shared/status-timeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState, Skeleton } from '@/components/ui/feedback';
import { api, ApiError, errorMessage, uploadWithProgress } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';

export default function CustomerRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [images, setImages] = React.useState<PickedImage[]>([]);
  const [progress, setProgress] = React.useState<number | null>(null);

  const request = useQuery({ queryKey: ['customer', 'request', id], queryFn: () => api<CustomerQuoteRequest>(`/customer/quote-requests/${id}`) });
  const messages = useQuery({ queryKey: ['customer', 'messages', id], queryFn: () => api<RequestMessage[]>(`/customer/quote-requests/${id}/messages`), refetchInterval: 30_000 });
  const send = useMutation({
    mutationFn: (body: string) => api<RequestMessage>(`/customer/quote-requests/${id}/messages`, { method: 'POST', body: { body } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer', 'messages', id] }),
    onError: (e) => toast.error('Message not sent', { description: errorMessage(e) }),
  });

  const upload = async () => {
    if (!images.length) return;
    const form = new FormData();
    images.forEach((img) => form.append('images', img.file, img.file.name));
    try {
      setProgress(0);
      await uploadWithProgress(`/customer/quote-requests/${id}/images`, form, setProgress);
      setImages([]);
      toast.success('Photos uploaded');
      await qc.invalidateQueries({ queryKey: ['customer', 'request', id] });
    } catch (e) {
      toast.error('Upload failed', { description: errorMessage(e) });
    } finally {
      setProgress(null);
    }
  };

  if (request.isError) {
    const notFound = request.error instanceof ApiError && request.error.status === 404;
    return <ErrorState title={notFound ? 'Request not found' : 'Could not load request'} description={notFound ? 'This request does not exist or does not belong to your account.' : errorMessage(request.error)} />;
  }
  if (request.isLoading || !request.data) return <Skeleton className="h-96 rounded-3xl" />;
  const r = request.data;

  return (
    <div className="space-y-6">
      <Link href="/customer/requests" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> All requests
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-sm font-bold text-slate-500">{r.reference}</p>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{r.service?.title ?? 'General enquiry'}</h1>
        </div>
        <StatusBadge status={r.status} className="self-start px-3.5 py-1.5 text-sm" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                {[
                  ['Type', REQUEST_TYPE_LABELS[r.type]],
                  ['Submitted', formatDateTime(r.createdAt)],
                  ['Location', r.location],
                  ['Property type', PROPERTY_TYPE_LABELS[r.propertyType]],
                  ['Preferred contact', CONTACT_METHOD_LABELS[r.preferredContact]],
                  ['Phone', r.phone],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-semibold text-navy-900">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6">
                <p className="text-sm text-slate-500">Problem description</p>
                <p className="mt-1 whitespace-pre-line text-slate-800">{r.description}</p>
              </div>
              {r.additionalNotes && (
                <div className="mt-4">
                  <p className="text-sm text-slate-500">Additional notes</p>
                  <p className="mt-1 whitespace-pre-line text-slate-800">{r.additionalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {r.images.length > 0 ? (
                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {r.images.map((img) => (
                    <li key={img.id}>
                      <a href={img.url} target="_blank" rel="noopener noreferrer" className="block aspect-square overflow-hidden rounded-xl ring-1 ring-line">
                        {/* eslint-disable-next-line @next/next/no-img-element -- private authenticated image */}
                        <img src={img.url} alt={img.originalName ?? 'Request photo'} className="size-full object-cover" loading="lazy" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No photos attached yet.</p>
              )}
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy-900">
                  <ImagePlus className="size-4" aria-hidden /> Add more photos
                </p>
                <ImagePicker id="more-images" value={images} onChange={setImages} max={MAX_QUOTE_IMAGES} onError={(m) => toast.error(m)} disabled={progress !== null} />
                {progress !== null && (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
                    <div className="h-full bg-gold-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                )}
                {images.length > 0 && (
                  <Button className="mt-4" onClick={upload} loading={progress !== null}>
                    Upload {images.length} photo{images.length > 1 ? 's' : ''}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <p className="text-sm text-slate-500">Chat with our team about this request.</p>
            </CardHeader>
            <CardContent>
              <MessageThread messages={messages.data ?? []} perspective="customer" onSend={(b) => send.mutateAsync(b)} sending={send.isPending} />
            </CardContent>
          </Card>
        </div>

        <aside>
          <Card className="lg:sticky lg:top-36">
            <CardHeader>
              <CardTitle>Status history</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline history={r.statusHistory} />
              <p className="mt-6 text-xs text-slate-500">Our team contacts you directly to confirm scheduling. This is not an online booking.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
