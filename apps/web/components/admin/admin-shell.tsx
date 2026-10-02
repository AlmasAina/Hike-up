'use client';

import { ExternalLink, LogOut, Menu, Search, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { LogoLockup } from '@/components/brand/logo';
import { NotificationsBell } from '@/components/shared/notifications-bell';
import { StatusPage } from '@/components/status-page';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ErrorState, Spinner } from '@/components/ui/feedback';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { isBackOffice, useLogout, useMe } from '@/hooks/use-auth';
import { cn, initials } from '@/lib/utils';
import { ADMIN_NAV, canAccess, requiredRolesFor } from './nav';
import { ShieldAlert } from 'lucide-react';

function SidebarNav({ roles, onNavigate }: { roles: string[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="space-y-6 px-3 py-5">
      {ADMIN_NAV.map((group) => {
        const items = group.items.filter((i) => canAccess(roles as never, i));
        if (!items.length) return null;
        return (
          <div key={group.section}>
            <p className="px-3 text-[11px] font-bold tracking-[0.18em] text-navy-300 uppercase">{group.section}</p>
            <ul className="mt-2 space-y-0.5">
              {items.map(({ href, label, Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                        active ? 'bg-gold-500 font-semibold text-navy-950 shadow-gold' : 'text-navy-100 hover:bg-white/10 hover:text-white',
                      )}
                    >
                      <Icon className="size-[18px]" aria-hidden />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading, isError, refetch } = useMe();
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (!isLoading && !isError && !me) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [me, isLoading, isError, pathname, router]);

  if (isError)
    return (
      <div className="p-10">
        <ErrorState description="Could not reach the server." onRetry={() => refetch()} />
      </div>
    );
  if (isLoading || !me)
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-100">
        <Spinner label="Loading admin" />
      </div>
    );
  if (!isBackOffice(me))
    return <StatusPage code="403" Icon={ShieldAlert} title="Access denied" description="Your account does not have access to the admin panel." />;

  const required = requiredRolesFor(pathname);
  const allowed = !required || required.some((r) => me.roles.includes(r)) || (me.roles.includes('SUPER_ADMIN') && required.includes('ADMIN'));

  const sidebar = (
    <div className="flex h-full flex-col bg-navy-950">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <LogoLockup tone="light" />
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav roles={me.roles} onNavigate={() => setMobileOpen(false)} />
      </div>
      <div className="border-t border-white/10 p-4 text-xs text-navy-300">
        Signed in as <span className="font-semibold text-white">{me.roles.join(', ').replace(/_/g, ' ')}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="grid size-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent title="Admin navigation" side="left" className="w-72 bg-navy-950 p-0 [&>button]:text-white">
              {sidebar}
            </SheetContent>
          </Sheet>
          <form
            role="search"
            className="relative hidden max-w-md flex-1 sm:block"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/admin/quote-requests?search=${encodeURIComponent(search.trim())}`);
            }}
          >
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requests by reference, name, phone…"
              aria-label="Search quote requests"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-3 pl-9 text-sm focus:border-navy-400 focus:bg-white focus:ring-4 focus:ring-navy-100 focus:outline-none"
            />
          </form>
          <div className="ml-auto flex items-center gap-1.5">
            <Link href="/" target="_blank" className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 md:flex">
              <ExternalLink className="size-4" aria-hidden /> View site
            </Link>
            <NotificationsBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-slate-100" aria-label="Account menu">
                  <span className="grid size-9 place-items-center rounded-full bg-navy-800 text-sm font-bold text-gold-400">{initials(`${me.firstName} ${me.lastName}`)}</span>
                  <span className="hidden text-left text-sm leading-tight md:block">
                    <span className="block font-semibold text-navy-900">{me.firstName}</span>
                    <span className="block text-xs text-slate-500">{me.roles[0]?.replace('_', ' ').toLowerCase()}</span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>{me.email}</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/admin/account">
                    <UserRound /> My account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => logout.mutate()} className="text-rose-600">
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">
          {allowed ? (
            children
          ) : (
            <ErrorState title="Access restricted" description="Your role does not have permission to view this section. Contact a super administrator if you need access." />
          )}
        </main>
      </div>
    </div>
  );
}
