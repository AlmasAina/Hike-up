'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, Phone, Trash2, UserPlus, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';
import {
  CONTACT_METHOD_LABELS,
  PROPERTY_TYPE_LABELS,
  QUOTE_STATUSES,
  QUOTE_STATUS_LABELS,
  REQUEST_TYPE_LABELS,
  type AdminQuoteRequest,
  type Paginated,
  type QuoteStatus,
  type TechnicianSummary,
} from '@hikeup/types';
import { buildTelUrl, buildWhatsAppUrl } from '@hikeup/ui';
import { announceCall, buildGmailComposeUrl } from '@/components/admin/contact-actions';
import { useConfirm } from '@/components/admin/confirm';
import { WhatsAppIcon } from '@/components/brand/social-icons';
import { MessageThread } from '@/components/shared/message-thread';
import { StatusBadge } from '@/components/shared/status-badge';
import { StatusTimeline } from '@/components/shared/status-timeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState, Skeleton } from '@/components/ui/feedback';
import { Select, Textarea } from '@/components/ui/input';
import { useAdminMutation } from '@/hooks/use-admin';
import { isManager, useMe } from '@/hooks/use-auth';
import { api, errorMessage } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';

export default function AdminQuoteRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: me } = useMe();
  const manager = isManager(me);
  const key = ['admin', 'quote-request', id];
  const { data: r, isLoading, isError, error, refetch } = useQuery({ queryKey: key, queryFn: () => api<AdminQuoteRequest>(`/admin/quote-requests/${id}`) });
  const technicians = useQuery({
    queryKey: ['admin', 'technicians-active'],
    queryFn: () => api<Paginated<TechnicianSummary>>('/admin/technicians?status=ACTIVE&pageSize=100'),
    enabled: manager,
  });
  const [status, setStatus] = React.useState<QuoteStatus | ''>('');
  const [statusNote, setStatusNote] = React.useState('');
  const [note, setNote] = React.useState('');
  const [techId, setTechId] = React.useState('');
  const { confirm, dialog } = useConfirm();
  const opts = { invalidate: [key, ['admin', 'quote-requests']], revalidateSite: false };

  const updateStatus = useAdminMutation(
    (body: { status: QuoteStatus; note?: string }) => api<AdminQuoteRequest>(`/admin/quote-requests/${id}`, { method: 'PATCH', body }),
    { ...opts, success: 'Status updated — customer notified', onSuccess: () => { setStatus(''); setStatusNote(''); } },
  );
  const addNote = useAdminMutation((body: string) => api(`/admin/quote-requests/${id}/notes`, { method: 'POST', body: { body } }), { ...opts, success: 'Note added', onSuccess: () => setNote('') });
  const reply = useAdminMutation((body: string) => api(`/admin/quote-requests/${id}/messages`, { method: 'POST', body: { body } }), { ...opts, success: 'Message sent to customer' });
  const assign = useAdminMutation((technicianId: string) => api(`/admin/quote-requests/${id}/assignments`, { method: 'POST', body: { technicianId } }), { ...opts, success: 'Technician assigned', onSuccess: () => setTechId('') });
  const unassign = useAdminMutation((technicianId: string) => api(`/admin/quote-requests/${id}/assignments/${technicianId}`, { method: 'DELETE' }), { ...opts, success: 'Assignment removed' });
  const remove = useAdminMutation(() => api(`/admin/quote-requests/${id}`, { method: 'DELETE' }), { invalidate: [['admin', 'quote-requests']], revalidateSite: false, success: 'Request deleted', onSuccess: () => router.replace('/admin/quote-requests') });

  if (isError) return <ErrorState description={errorMessage(error)} onRetry={() => refetch()} />;
  if (isLoading || !r) return <Skeleton className="h-[32rem] rounded-2xl" />;

  const waMessage = `Hello ${r.firstName}, this is HIKE UP General Maintenance regarding your request ${r.reference}.`;
  const contact = [
    { href: buildTelUrl(r.phone), label: 'Call', Icon: Phone, variant: 'navy' as const, onClick: () => announceCall(r.phone) },
    { href: buildWhatsAppUrl(r.whatsapp || r.phone, waMessage), label: 'WhatsApp', Icon: WhatsAppIcon, variant: 'whatsapp' as const, external: true },
    { href: buildGmailComposeUrl(r.email, `Your request ${r.reference}`), label: 'Email', Icon: Mail, variant: 'outline' as const, external: true },
  ];
  const assignedIds = new Set(r.assignments.map((a) => a.technician.id));

  return (
    <div className="space-y-6">
      {dialog}
      <Link href="/admin/quote-requests" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> All requests
      </Link>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-500">{r.reference}</span>
            <StatusBadge status={r.status} />
            <span className="text-xs text-slate-500">{REQUEST_TYPE_LABELS[r.type]}</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold">
            {r.firstName} {r.lastName} — {r.service?.title ?? 'General enquiry'}
          </h1>
          <p className="text-sm text-slate-500">Submitted {formatDateTime(r.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {contact.map(({ href, label, Icon, variant, external, onClick }) => (
            <Button key={label} asChild variant={variant} size="sm">
              <a href={href} onClick={onClick} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                <Icon className="size-4" aria-hidden /> {label}
              </a>
            </Button>
          ))}
          {manager && (
            <Button
              size="sm"
              variant="ghost"
              className="text-rose-600"
              onClick={async () => {
                if (await confirm({ title: 'Delete this request?', description: 'The request will be archived and hidden from all lists.', confirmLabel: 'Delete', destructive: true })) remove.mutate(undefined);
              }}
            >
              <Trash2 aria-hidden /> Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer & job details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ['Email', r.email],
                  ['Phone', r.phone],
                  ['WhatsApp', r.whatsapp ?? '—'],
                  ['Preferred contact', CONTACT_METHOD_LABELS[r.preferredContact]],
                  ['Location', r.location],
                  ['Property type', PROPERTY_TYPE_LABELS[r.propertyType]],
                  ['Customer account', r.customerId ? 'Registered customer' : 'Guest submission'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-semibold break-words text-navy-900">
                      {k === 'Customer account' && r.customerId && manager ? (
                        <Link href={`/admin/customers/${r.customerId}`} className="text-navy-700 underline">
                          {v}
                        </Link>
                      ) : (
                        v
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Problem description</p>
                <p className="mt-1 whitespace-pre-line text-slate-800">{r.description}</p>
                {r.additionalNotes && (
                  <>
                    <p className="mt-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">Additional notes</p>
                    <p className="mt-1 whitespace-pre-line text-slate-800">{r.additionalNotes}</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photos ({r.images.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {r.images.length ? (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {r.images.map((img) => (
                    <li key={img.id}>
                      <a href={img.url} target="_blank" rel="noopener noreferrer" className="block aspect-square overflow-hidden rounded-xl ring-1 ring-slate-200 hover:ring-navy-400">
                        {/* eslint-disable-next-line @next/next/no-img-element -- private authenticated image */}
                        <img src={img.url} alt={img.originalName ?? 'Customer photo'} className="size-full object-cover" loading="lazy" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No photos uploaded.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Messages with customer</CardTitle>
              <p className="text-sm text-slate-500">Visible to the customer in their dashboard and sent by email.</p>
            </CardHeader>
            <CardContent>
              <MessageThread
                messages={r.messages}
                perspective="staff"
                onSend={(b) => reply.mutateAsync(b)}
                sending={reply.isPending}
                disabledReason={r.customerId ? undefined : 'This request was submitted without an account — contact the customer by phone, WhatsApp or email.'}
              />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Update status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select aria-label="New status" value={status || r.status} onChange={(e) => setStatus(e.target.value as QuoteStatus)}>
                {QUOTE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {QUOTE_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
              <Textarea rows={2} aria-label="Note for the customer (optional)" placeholder="Optional note shown to the customer" value={statusNote} maxLength={500} onChange={(e) => setStatusNote(e.target.value)} />
              <Button
                className="w-full"
                variant="navy"
                disabled={!status || status === r.status}
                loading={updateStatus.isPending}
                onClick={() => status && updateStatus.mutate({ status, ...(statusNote.trim() ? { note: statusNote.trim() } : {}) })}
              >
                Save status
              </Button>
            </CardContent>
          </Card>

          {manager && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned technicians</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {r.assignments.length === 0 && <p className="text-sm text-slate-500">No one assigned yet.</p>}
                <ul className="space-y-2">
                  {r.assignments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                      <span>
                        <span className="font-semibold text-navy-900">{a.technician.name}</span>
                        {a.technician.role && <span className="block text-xs text-slate-500">{a.technician.role}</span>}
                      </span>
                      <button onClick={() => unassign.mutate(a.technician.id)} className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove ${a.technician.name}`}>
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Select aria-label="Technician" value={techId} onChange={(e) => setTechId(e.target.value)}>
                    <option value="">Select technician…</option>
                    {technicians.data?.items
                      .filter((t) => !assignedIds.has(t.id))
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                          {t.skills.length ? ` — ${t.skills.slice(0, 3).join(', ')}` : ''}
                        </option>
                      ))}
                  </Select>
                  <Button size="icon" variant="navy" disabled={!techId} loading={assign.isPending} onClick={() => assign.mutate(techId)} aria-label="Assign technician" className="size-11">
                    {!assign.isPending && <UserPlus aria-hidden />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Internal notes</CardTitle>
              <p className="text-xs text-slate-500">Never visible to the customer.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea rows={3} aria-label="New internal note" placeholder="Add an internal note…" value={note} onChange={(e) => setNote(e.target.value)} maxLength={5000} />
              <Button size="sm" variant="outline" disabled={!note.trim()} loading={addNote.isPending} onClick={() => addNote.mutate(note.trim())}>
                Add note
              </Button>
              <ul className="space-y-3 pt-2">
                {r.internalNotes.map((n) => (
                  <li key={n.id} className="rounded-xl bg-amber-50/70 p-3 text-sm ring-1 ring-amber-100">
                    <p className="whitespace-pre-line text-slate-800">{n.body}</p>
                    <p className="mt-1.5 text-xs text-slate-500">
                      {n.author.name} · {formatDateTime(n.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status history</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline history={r.statusHistory} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
