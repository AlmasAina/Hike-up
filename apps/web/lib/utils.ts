import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const dateFormatter = new Intl.DateTimeFormat('en-AE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dubai' });
const dateTimeFormatter = new Intl.DateTimeFormat('en-AE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Dubai',
});

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  return dateFormatter.format(typeof value === 'string' ? new Date(value) : value);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  return dateTimeFormatter.format(typeof value === 'string' ? new Date(value) : value);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/** Only allow same-site relative redirect targets (prevents open redirects). */
export function safeRedirect(target: string | null | undefined, fallback = '/'): string {
  if (!target || !target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return fallback;
  return target;
}

/** True for images we ship as SVG illustrations (rendered without the image optimiser). */
export function isSvg(src: string | null | undefined): boolean {
  return Boolean(src && /\.svg($|\?)/i.test(src));
}
