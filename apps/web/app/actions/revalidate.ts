'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { AuthUser } from '@hikeup/types';
import { apiInternalBase } from '@/lib/env';

/**
 * Called by the admin panel after content changes so the public website updates immediately
 * (instead of waiting for the 60 s ISR window). Only back-office managers may trigger it.
 */
export async function revalidatePublicSite(): Promise<{ ok: boolean }> {
  const cookieHeader = (await cookies()).toString();
  try {
    const res = await fetch(`${apiInternalBase()}/auth/me`, { headers: { cookie: cookieHeader }, cache: 'no-store' });
    if (!res.ok) return { ok: false };
    const user = (await res.json()) as AuthUser;
    if (!user.roles.some((r) => r === 'SUPER_ADMIN' || r === 'ADMIN')) return { ok: false };
  } catch {
    return { ok: false };
  }
  revalidatePath('/', 'layout');
  return { ok: true };
}
