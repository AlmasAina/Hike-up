'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { AuthResponse, AuthUser, RoleName } from '@hikeup/types';
import { api, ApiError } from '@/lib/api-client';

export const ME_KEY = ['auth', 'me'] as const;

/** Current session (null when signed out). Never throws for 401. */
export function useMe(enabled = true) {
  return useQuery<AuthUser | null>({
    queryKey: ME_KEY,
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      try {
        return await api<AuthUser>('/auth/me');
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return null;
        throw error;
      }
    },
  });
}

export function hasRole(user: AuthUser | null | undefined, ...roles: RoleName[]): boolean {
  return Boolean(user?.roles.some((r) => roles.includes(r)));
}

export const isBackOffice = (user: AuthUser | null | undefined) => hasRole(user, 'SUPER_ADMIN', 'ADMIN', 'STAFF');
export const isManager = (user: AuthUser | null | undefined) => hasRole(user, 'SUPER_ADMIN', 'ADMIN');

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) => api<AuthResponse>('/auth/login', { method: 'POST', body }),
    onSuccess: (data) => qc.setQueryData(ME_KEY, data.user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => api<void>('/auth/logout', { method: 'POST', body: {} }),
    onSettled: () => {
      qc.setQueryData(ME_KEY, null);
      qc.clear();
      router.replace('/auth/login');
      router.refresh();
    },
  });
}
