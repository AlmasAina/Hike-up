import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { JsonLd } from '@/components/json-ld';
import { absoluteUrl } from '@/lib/seo';

export interface Crumb {
  label: string;
  href?: string;
}

/** Inner page header with breadcrumbs (and BreadcrumbList structured data). */
export function PageHero({ title, subtitle, crumbs, children }: { title: string; subtitle?: string | null; crumbs: Crumb[]; children?: React.ReactNode }) {
  const all: Crumb[] = [{ label: 'Home', href: '/' }, ...crumbs];
  return (
    <section className="relative overflow-hidden bg-hero text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div className="pointer-events-none absolute -right-24 -bottom-32 size-96 rounded-full border-[40px] border-gold-500/10" aria-hidden />
      <div className="container-page relative py-14 sm:py-20">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-navy-200">
            {all.map((crumb, i) => (
              <li key={crumb.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3.5 text-navy-400" aria-hidden />}
                {crumb.href && i < all.length - 1 ? (
                  <Link href={crumb.href} className="transition hover:text-white">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-medium text-gold-300">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="mt-5 max-w-4xl font-display text-4xl leading-tight font-extrabold text-white sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-navy-100">{subtitle}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: all.map((crumb, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: crumb.label,
            ...(crumb.href ? { item: absoluteUrl(crumb.href) } : {}),
          })),
        }}
      />
    </section>
  );
}
