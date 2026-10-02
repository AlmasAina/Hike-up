'use client';

import { useQuery } from '@tanstack/react-query';
import { Archive, Mail, Phone, Reply, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { buildMailtoUrl, buildTelUrl, buildWhatsAppUrl } from '@hikeup/ui';
import type { ContactMessage, ContactMessageStatus } from '@hikeup/types';
import { WhatsAppIcon } from '@/components/brand/social-icons';
import { useConfirm } from '@/components/admin/confirm';
import { DataTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/feedback';
import { Select } from '@/components/ui/input';
import { useAdminList, useAdminMutation } from '@/hooks/use-admin';
import { api } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';

const STATUS_VARIANT: Record<ContactMessageStatus, 'gold' | 'neutral' | 'success' | 'navy'> = { NEW: 'gold', READ: 'neutral', REPLIED: 'success', ARCHIVED: 'navy' };

function MessageDialog({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data } = useQuery({ queryKey: ['admin', 'contact-message', id], queryFn: () => api<ContactMessage>(`/admin/contact-messages/${id}`), enabled: Boolean(id) });
  const { confirm, dialog } = useConfirm();
  const opts = { revalidateSite: false, invalidate: [['admin', 'contact-messages'], ['admin', 'contact-message', id]] };
  const setStatus = useAdminMutation((status: ContactMessageStatus) => api(`/admin/contact-messages/${id}`, { method: 'PATCH', body: { status } }), { ...opts, success: 'Message updated' });
  const remove = useAdminMutation(() => api(`/admin/contact-messages/${id}`, { method: 'DELETE' }), { ...opts, success: 'Message deleted', onSuccess: onClose });
  return (
    <Dialog open={Boolean(id)} onOpenChange={(o) => !o && onClose()}>
      {dialog}
      <DialogContent title={data?.subject ?? 'Message'} className="max-w-2xl">
        {!data ? (
          <Skeleton className="h-40" />
        ) : (
          <div className="space-y-5">
            <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-slate-500">From</dt>
                <dd className="font-semibold">{data.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="font-semibold break-all">{data.email}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Received</dt>
                <dd className="font-semibold">{formatDateTime(data.createdAt)}</dd>
              </div>
            </dl>
            <p className="whitespace-pre-line text-slate-800">{data.message}</p>
            <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
              <Button asChild size="sm" variant="navy" onClick={() => setStatus.mutate('REPLIED')}>
                <a href={buildMailtoUrl(data.email, `Re: ${data.subject}`)}>
                  <Reply aria-hidden /> Reply by email
                </a>
              </Button>
              {data.phone && (
                <>
                  <Button asChild size="sm" variant="outline">
                    <a href={buildTelUrl(data.phone)}>
                      <Phone aria-hidden /> Call
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="whatsapp">
                    <a href={buildWhatsAppUrl(data.phone)} target="_blank" rel="noopener noreferrer">
                      <WhatsAppIcon className="size-4" /> WhatsApp
                    </a>
                  </Button>
                </>
              )}
              <Button size="sm" variant="ghost" onClick={() => setStatus.mutate('REPLIED')}>
                <Mail aria-hidden /> Mark replied
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setStatus.mutate('ARCHIVED')}>
                <Archive aria-hidden /> Archive
              </Button>
              <Button size="sm" variant="ghost" className="ml-auto text-rose-600" onClick={async () => (await confirm({ title: 'Delete this message permanently?', confirmLabel: 'Delete', destructive: true })) && remove.mutate(undefined)}>
                <Trash2 aria-hidden /> Delete
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MessagesInner() {
  const router = useRouter();
  const params = useSearchParams();
  const openId = params.get('id');
  const list = useAdminList<ContactMessage>('contact-messages', { status: '' });
  return (
    <>
      <MessageDialog id={openId} onClose={() => router.replace('/admin/messages', { scroll: false })} />
      <PageHeader title="Contact Messages" description="Messages sent through the website contact form. Customer conversations about requests are on each request page." />
      <DataTable
        rows={list.query.data?.items}
        rowKey={(r) => r.id}
        loading={list.query.isLoading}
        error={list.query.error}
        onRetry={() => list.query.refetch()}
        search={list.search}
        onSearch={list.setSearch}
        searchPlaceholder="Search name, email or subject"
        order={list.order}
        onToggleOrder={list.toggleOrder}
        page={list.query.data?.page}
        totalPages={list.query.data?.totalPages}
        total={list.query.data?.total}
        onPage={list.setPage}
        onRowClick={(r) => router.replace(`/admin/messages?id=${r.id}`, { scroll: false })}
        filters={
          <Select aria-label="Filter by status" value={list.filters.status} onChange={(e) => list.setFilter('status', e.target.value)}>
            <option value="">Inbox (not archived)</option>
            <option value="NEW">New</option>
            <option value="READ">Read</option>
            <option value="REPLIED">Replied</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        }
        columns={[
          {
            key: 'from',
            header: 'From',
            primary: true,
            cell: (m) => (
              <span className={m.status === 'NEW' ? 'font-bold' : ''}>
                <span className="block text-navy-900">{m.name}</span>
                <span className="text-xs font-normal text-slate-500">{m.email}</span>
              </span>
            ),
          },
          { key: 'subject', header: 'Subject', cell: (m) => <span className="line-clamp-1">{m.subject}</span> },
          { key: 'date', header: 'Received', cell: (m) => <span className="text-xs">{formatDateTime(m.createdAt)}</span> },
          { key: 'status', header: 'Status', primary: true, cell: (m) => <Badge variant={STATUS_VARIANT[m.status]}>{m.status.toLowerCase()}</Badge> },
        ]}
      />
    </>
  );
}

export default function AdminMessagesPage() {
  return (
    <Suspense>
      <MessagesInner />
    </Suspense>
  );
}
