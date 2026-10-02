import { NextResponse, type NextRequest } from 'next/server';

const REFRESH_COOKIE = 'hu_rt';

/**
 * Edge route guard (Next.js 16 "proxy", formerly middleware).
 * Only checks that a session cookie exists — real authorisation (roles, ownership) is enforced by
 * the API on every request and by the dashboard layouts.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(REFRESH_COOKIE);

  if (!hasSession) {
    const isAdmin = pathname.startsWith('/admin');
    const loginPath = isAdmin ? '/admin/login' : '/auth/login';
    if (pathname === '/admin/login') return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/customer/:path*', '/admin/:path*'],
};
