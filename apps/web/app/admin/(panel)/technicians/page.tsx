'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';
import { Suspense } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { buildTelUrl, buildWhatsAppUrl } from '@hikeup/ui';
import type { TechnicianSummary } from '@hikeup/types';
import { PasswordInput } from '@/components/auth/password-input';
import { WhatsAppIcon } from '@/components/brand/social-icons';
import { useConfirm } from '@/components/admin/confirm';
import { DataTable } from '@/components/admin/data-table';
import { SingleImageUpload } from '@/components/admin/image-upload';
import { PageHeader } from '@/components/admin/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input, Select } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminList, useAdminMutation } from '@/hooks/use-admin';
import { api } from '@/lib/api-client';
import { initials } from '@/lib/utils';

const phone = z.string().regex(/^\+?[0-9][0-9\s\-()]{6,19}$/, 'Invalid phone').or(z.literal(''));
const schema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(160),
  email: z.string().email('Invalid email').or(z.literal('')),
  phone,
  whatsapp: phone,
  role: z.string().max(80),
  skills: z.string().max(600),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  image: z.object({ url: z.string(), key: z.string().nullable().optional() }).nullable(),
});
type Values = z.infer<typeof schema>;

function TechnicianDialog({ item, open, onClose }: { item: TechnicianSummary | null; open: boolean; onClose: () => void }) {
  const { register, control, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      name: item?.name ?? '',
      email: item?.email ?? '',
      phone: item?.phone ?? '',
      whatsapp: item?.whatsapp ?? '',
      role: item?.role ?? '',
      skills: item?.skills.join(', ') ?? '',
      status: item?.status ?? 'ACTIVE',
      image: item?.imageUrl ? { url: item.imageUrl, key: item.imageKey } : null,
    },
  });
  const save = useAdminMutation(
    ({ image, skills, ...v }: Values) => {
      const body = { ...v, skills: skills.split(',').map((s) => s.trim()).filter(Boolean), imageUrl: image?.url ?? '', imageKey: image?.key ?? '' };
      return item ? api(`/admin/technicians/${item.id}`, { method: 'PATCH', body }) : api('/admin/technicians', { method: 'POST', body });
    },
    { success: 'Technician saved', revalidateSite: false, onSuccess: onClose },
  );
  const { errors } = formState;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent title={item ? 'Edit technician' : 'New technician'} className="max-w-2xl">
        <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="tech-name" label="Name" required error={errors.name?.message}>
              <Input {...register('name')} />
            </FormField>
            <FormField id="tech-role" label="Role / title" hint="e.g. AC Technician">
              <Input {...register('role')} />
            </FormField>
            <FormField id="tech-email" label="Email" error={errors.email?.message} hint="Required to create a login">
              <Input type="email" {...register('email')} />
            </FormField>
            <FormField id="tech-phone" label="Phone" error={errors.phone?.message}>
              <Input type="tel" {...register('phone')} />
            </FormField>
            <FormField id="tech-wa" label="WhatsApp" error={errors.whatsapp?.message}>
              <Input type="tel" {...register('whatsapp')} />
            </FormField>
            <FormField id="tech-status" label="Status">
              <Select {...register('status')}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive (login disabled)</option>
              </Select>
            </FormField>
          </div>
          <FormField id="tech-skills" label="Skills" hint="Comma separated, e.g. Electrical, Plumbing, AC">
            <Input {...register('skills')} />
          </FormField>
          <div className="space-y-1.5">
            <Label>Profile image</Label>
            <Controller control={control} name="image" render={({ field }) => <SingleImageUpload value={field.value} onChange={field.onChange} folder="technicians" label="Photo" />} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="navy" loading={save.isPending}>
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LoginDialog({ item, onClose }: { item: TechnicianSummary | null; onClose: () => void }) {
  const [password, setPassword] = React.useState('');
  const valid = /^(?=.*[A-Za-z])(?=.*\d).{8,128}$/.test(password);
  const save = useAdminMutation(() => api(`/admin/technicians/${item!.id}/login`, { method: 'PUT', body: { password } }), {
    success: item?.userId ? 'Password reset — share it securely with the technician' : 'Staff login created',
    revalidateSite: false,
    onSuccess: () => {
      setPassword('');
      onClose();
    },
  });
  return (
    <Dialog open={Boolean(item)} onOpenChange={(o) => !o && onClose()}>
      {item && (
        <DialogContent
          title={item.userId ? `Reset login for ${item.name}` : `Create login for ${item.name}`}
          description={`Staff logins can only view and update requests assigned to them. Login email: ${item.email ?? '— add an email first'}`}
        >
          <div className="space-y-4">
            <FormField id="tech-password" label="Password" hint="At least 8 characters with a letter and a number">
              <PasswordInput autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </FormField>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="navy" disabled={!valid || !item.email} loading={save.isPending} onClick={() => save.mutate(undefined)}>
                {item.userId ? 'Reset password' : 'Create login'}
              </Button>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

function TechniciansInner() {
  const list = useAdminList<TechnicianSummary>('technicians', { status: '' });
  const [editing, setEditing] = React.useState<TechnicianSummary | null | 'new'>(null);
  const [loginFor, setLoginFor] = React.useState<TechnicianSummary | null>(null);
  const { confirm, dialog } = useConfirm();
  const remove = useAdminMutation((id: string) => api(`/admin/technicians/${id}`, { method: 'DELETE' }), { success: 'Technician removed', revalidateSite: false });
  return (
    <>
      {dialog}
      <TechnicianDialog item={editing === 'new' ? null : editing} open={editing !== null} onClose={() => setEditing(null)} />
      <LoginDialog item={loginFor} onClose={() => setLoginFor(null)} />
      <PageHeader
        title="Technicians & Staff"
        description="Manage technicians, their skills and restricted staff logins. Assign them to requests from the request page."
        actions={
          <Button variant="navy" onClick={() => setEditing('new')}>
            <Plus aria-hidden /> New technician
          </Button>
        }
      />
      <DataTable
        rows={list.query.data?.items}
        rowKey={(r) => r.id}
        loading={list.query.isLoading}
        error={list.query.error}
        onRetry={() => list.query.refetch()}
        search={list.search}
        onSearch={list.setSearch}
        searchPlaceholder="Search name, email, phone or skill"
        page={list.query.data?.page}
        totalPages={list.query.data?.totalPages}
        total={list.query.data?.total}
        onPage={list.setPage}
        onRowClick={(r) => setEditing(r)}
        filters={
          <Select aria-label="Filter by status" value={list.filters.status} onChange={(e) => list.setFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        }
        columns={[
          {
            key: 'name',
            header: 'Technician',
            primary: true,
            cell: (t) => (
              <span className="flex items-center gap-3">
                {t.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin uploaded avatar
                  <img src={t.imageUrl} alt="" className="size-10 rounded-full object-cover" />
                ) : (
                  <span className="grid size-10 place-items-center rounded-full bg-navy-800 text-xs font-bold text-gold-400">{initials(t.name)}</span>
                )}
                <span>
                  <span className="block font-semibold text-navy-900">{t.name}</span>
                  <span className="text-xs text-slate-500">{t.role ?? '—'}</span>
                </span>
              </span>
            ),
          },
          { key: 'skills', header: 'Skills', cell: (t) => <span className="flex flex-wrap gap-1">{t.skills.map((s) => <Badge key={s}>{s}</Badge>)}</span> },
          { key: 'active', header: 'Open jobs', cell: (t) => t.activeAssignments ?? 0 },
          { key: 'login', header: 'Login', cell: (t) => (t.userId ? <Badge variant="navy">Staff login</Badge> : <span className="text-xs text-slate-400">None</span>) },
          { key: 'status', header: 'Status', primary: true, cell: (t) => <Badge variant={t.status === 'ACTIVE' ? 'success' : 'neutral'}>{t.status === 'ACTIVE' ? 'Active' : 'Inactive'}</Badge> },
          {
            key: 'actions',
            header: 'Actions',
            cell: (t) => (
              <span className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                {t.phone && (
                  <Button asChild size="sm" variant="ghost" aria-label={`Call ${t.name}`}>
                    <a href={buildTelUrl(t.phone)}>
                      <Phone aria-hidden />
                    </a>
                  </Button>
                )}
                {(t.whatsapp || t.phone) && (
                  <Button asChild size="sm" variant="ghost" aria-label={`WhatsApp ${t.name}`}>
                    <a href={buildWhatsAppUrl(t.whatsapp || t.phone)} target="_blank" rel="noopener noreferrer">
                      <WhatsAppIcon className="size-4" />
                    </a>
                  </Button>
                )}
                <Button size="sm" variant="ghost" aria-label="Staff login" onClick={() => setLoginFor(t)}>
                  <KeyRound aria-hidden />
                </Button>
                <Button size="sm" variant="ghost" aria-label="Edit" onClick={() => setEditing(t)}>
                  <Pencil aria-hidden />
                </Button>
                <Button size="sm" variant="ghost" className="text-rose-600" aria-label="Delete" onClick={async () => (await confirm({ title: `Remove ${t.name}?`, description: 'Their staff login will be disabled.', confirmLabel: 'Remove', destructive: true })) && remove.mutate(t.id)}>
                  <Trash2 aria-hidden />
                </Button>
              </span>
            ),
          },
        ]}
      />
    </>
  );
}

export default function AdminTechniciansPage() {
  return (
    <Suspense>
      <TechniciansInner />
    </Suspense>
  );
}
