'use client';

import { FileText, LayoutDashboard, LogOut, MessageSquare, Plus, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { LogoLockup } from '@/components/brand/logo';
import { NotificationsBell } from '@/components/shared/notifications-bell';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ErrorState, Spinner } from '@/components/ui/feedback';
import { isBackOffice, useLogout, useMe } from '@/hooks/use-auth';
import { cn, initials } from '@/lib/utils';

const NAV = [
  { href: '/customer/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/customer/requests', label: 'My Requests', Icon: FileText },
  { href: '/customer/messages', label: 'Messages', Icon: MessageSquare },
  { href: '/customer/profile', label: 'Profile', Icon: UserRound },
];

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading, isError, refetch } = useMe();
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();

  React.useEffect(() => {
    if (isLoading || isError) return;
    if (!me) router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
    else if (isBackOffice(me) && !me.roles.includes('CUSTOMER')) router.replace('/admin/dashboard');
  }, [me, isLoading, isError, pathname, router]);

  if (isError)
    return (
      <div className="container-page py-20">
        <ErrorState description="We could not load your account. Please check your connection." onRetry={() => refetch()} />
      </div>
    );
  if (isLoading || !me || (isBackOffice(me) && !me.roles.includes('CUSTOMER')))
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner label="Loading your account" />
      </div>
    );

  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <LogoLockup />
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/get-a-quote">
                <Plus aria-hidden /> New request
              </Link>
            </Button>
            <NotificationsBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-slate-100" aria-label="Account menu">
                  <span className="grid size-9 place-items-center rounded-full bg-navy-800 text-sm font-bold text-gold-400">{initials(`${me.firstName} ${me.lastName}`)}</span>
                  <span className="hidden text-sm font-semibold text-navy-900 md:inline">{me.firstName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>{me.email}</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/customer/profile">
                    <UserRound /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">Back to website</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => logout.mutate()} className="text-rose-600">
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <nav aria-label="Customer" className="container-page -mb-px flex gap-1 overflow-x-auto">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold whitespace-nowrap transition',
                  active ? 'border-gold-500 text-navy-900' : 'border-transparent text-slate-500 hover:text-navy-800',
                )}
              >
                <Icon className="size-4" aria-hidden /> {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main id="main" className="container-page py-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
