import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Header lockup: logo mark + typeset wordmark (crisper than shrinking the stacked logo). */
export function LogoLockup({ tone = 'dark', className, name = 'HIKE UP' }: { tone?: 'dark' | 'light'; className?: string; name?: string }) {
  const light = tone === 'light';
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
export function LogoFull({ tone = 'dark', className, priority = false }: { tone?: 'dark' | 'light'; className?: string; priority?: boolean }) {
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
