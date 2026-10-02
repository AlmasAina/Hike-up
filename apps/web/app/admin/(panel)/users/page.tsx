'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import * as React from 'react';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { AuthUser, RoleName } from '@hikeup/types';
import { PasswordInput } from '@/components/auth/password-input';
import { DataTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input, Select } from '@/components/ui/input';
import { useAdminList, useAdminMutation } from '@/hooks/use-admin';
import { useMe } from '@/hooks/use-auth';
import { api } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';

type Row = AuthUser & { lastLoginAt: string | null };
const ROLE_OPTIONS: { value: RoleName; label: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super admin — full access' },
  { value: 'ADMIN', label: 'Admin — content, requests, customers' },
  { value: 'STAFF', label: 'Staff — assigned requests only' },
];
const schema = z.object({
  firstName: z.string().trim().min(1, 'Required').max(80),
  lastName: z.string().trim().min(1, 'Required').max(80),
  email: z.string().email('Invalid email'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'STAFF']),
  password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d).{8,128}$/, 'At least 8 characters with a letter and a number'),
});
type Values = z.infer<typeof schema>;

function NewUserDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { register, handleSubmit, formState, reset } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { firstName: '', lastName: '', email: '', role: 'ADMIN', password: '' } });
  const save = useAdminMutation((v: Values) => api('/admin/users', { method: 'POST', body: v }), { success: 'User created', revalidateSite: false, onSuccess: () => { reset(); onClose(); } });
  const { errors } = formState;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent title="New admin user" description="Share the initial password securely; the user can change it under My Account.">
        <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="u-first" label="First name" required error={errors.firstName?.message}>
              <Input {...register('firstName')} />
            </FormField>
            <FormField id="u-last" label="Last name" required error={errors.lastName?.message}>
              <Input {...register('lastName')} />
            </FormField>
          </div>
          <FormField id="u-email" label="Email" required error={errors.email?.message}>
            <Input type="email" {...register('email')} />
          </FormField>
          <FormField id="u-role" label="Role">
            <Select {...register('role')}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="u-password" label="Initial password" required error={errors.password?.message}>
            <PasswordInput autoComplete="new-password" {...register('password')} />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="navy" loading={save.isPending}>
              Create user
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UsersInner() {
  const { data: me } = useMe();
  const list = useAdminList<Row>('users', { status: '' });
  const [creating, setCreating] = React.useState(false);
  const update = useAdminMutation((v: { id: string; role?: RoleName; status?: 'ACTIVE' | 'DISABLED' }) => api(`/admin/users/${v.id}`, { method: 'PATCH', body: { role: v.role, status: v.status } }), { success: 'User updated', revalidateSite: false });
  return (
    <>
      <NewUserDialog open={creating} onClose={() => setCreating(false)} />
      <PageHeader
        title="Admin Users"
        description="Back-office accounts and their roles. Only super admins can manage this list."
        actions={
          <Button variant="navy" onClick={() => setCreating(true)}>
            <Plus aria-hidden /> New user
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
        searchPlaceholder="Search users"
        page={list.query.data?.page}
        totalPages={list.query.data?.totalPages}
        total={list.query.data?.total}
        onPage={list.setPage}
        columns={[
          {
            key: 'name',
            header: 'User',
            primary: true,
            cell: (u) => (
              <span>
                <span className="block font-semibold text-navy-900">
                  {u.firstName} {u.lastName} {u.id === me?.id && <Badge variant="gold">You</Badge>}
                </span>
                <span className="text-xs text-slate-500">{u.email}</span>
              </span>
            ),
          },
          {
            key: 'role',
            header: 'Role',
            primary: true,
            cell: (u) => {
              const role = u.roles.find((r) => r !== 'CUSTOMER') ?? 'STAFF';
              return (
                <Select aria-label={`Role for ${u.email}`} className="h-9 w-40" value={role} disabled={u.id === me?.id} onChange={(e) => update.mutate({ id: u.id, role: e.target.value as RoleName })}>
                  <option value="SUPER_ADMIN">Super admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="STAFF">Staff</option>
                </Select>
              );
            },
          },
          { key: 'login', header: 'Last login', cell: (u) => <span className="text-xs">{formatDateTime(u.lastLoginAt)}</span> },
          {
            key: 'status',
            header: 'Status',
            cell: (u) => (
              <span className="flex items-center gap-2">
                <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'}>{u.status === 'ACTIVE' ? 'Active' : 'Disabled'}</Badge>
                {u.id !== me?.id && (
                  <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: u.id, status: u.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' })}>
                    {u.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                  </Button>
                )}
              </span>
            ),
          },
        ]}
      />
    </>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense>
      <UsersInner />
    </Suspense>
  );
}
