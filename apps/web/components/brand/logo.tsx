import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const DEFAULT_LOGO_URL = '/brand/hikeup-logo.png';

/** True when an admin uploaded a replacement logo in Site Settings. */
export function isCustomLogo(logoUrl?: string | null): logoUrl is string {
  return Boolean(logoUrl && logoUrl !== DEFAULT_LOGO_URL);
}

/** Header lockup: logo mark + typeset wordmark (crisper than shrinking the stacked logo). */
export function LogoLockup({
  tone = 'dark',
  className,
  name = 'HIKE UP',
  logoUrl,
}: {
  tone?: 'dark' | 'light';
  className?: string;
  name?: string;
  logoUrl?: string | null;
}) {
  const light = tone === 'light';
  if (isCustomLogo(logoUrl)) {
    return (
      <Link href="/" className={cn('inline-flex items-center', className)} aria-label={`${name} — home`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded logo of unknown dimensions */}
        <img src={logoUrl} alt={`${name} logo`} className="h-11 w-auto max-w-44 object-contain" />
      </Link>
    );
  }
  return (
    <Link href="/" className={cn('group inline-flex items-center gap-2.5', className)} aria-label={`${name} — home`}>
      <Image
        src={light ? '/brand/hikeup-mark-light.png' : '/brand/hikeup-mark.png'}
        alt=""
        width={56}
        height={41}
        priority
        className="h-10 w-auto transition-transform duration-300 group-hover:-translate-y-0.5 sm:h-11"
      />
      <span className="flex flex-col leading-none">
        <span className={cn('font-display text-xl font-extrabold tracking-tight sm:text-[22px]', light ? 'text-white' : 'text-navy-800')}>
          HIKE<span className="ml-[0.28em] text-gold-500">UP</span>
        </span>
        <span className={cn('mt-1 text-[9.5px] font-semibold tracking-[0.28em] uppercase sm:text-[10px]', light ? 'text-navy-200' : 'text-slate-500')}>
          General Maintenance
        </span>
      </span>
    </Link>
  );
}

/** Full stacked logo as supplied by the company. */
export function LogoFull({
  tone = 'dark',
  className,
  priority = false,
  logoUrl,
}: {
  tone?: 'dark' | 'light';
  className?: string;
  priority?: boolean;
  logoUrl?: string | null;
}) {
  if (isCustomLogo(logoUrl)) {
    return (
      <span className={cn('inline-block rounded-2xl bg-white p-3', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded logo of unknown dimensions */}
        <img src={logoUrl} alt="Company logo" className="h-auto w-full" />
      </span>
    );
  }
  return (
    <Image
      src={tone === 'light' ? '/brand/hikeup-logo-light.png' : '/brand/hikeup-logo.png'}
      alt="HIKE UP General Maintenance logo"
      width={900}
      height={781}
      priority={priority}
      className={cn('h-auto w-48', className)}
    />
  );
}
