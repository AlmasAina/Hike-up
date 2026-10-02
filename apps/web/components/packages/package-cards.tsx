import { Check, Crown, X } from 'lucide-react';
import Link from 'next/link';
import type { MaintenancePackage } from '@hikeup/types';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Package cards. Pricing is shown only when an admin has set it — never hard-coded. */
export function PackageCards({ packages }: { packages: MaintenancePackage[] }) {
  return (
    <RevealGroup className={cn('grid gap-6 md:grid-cols-2', packages.length >= 3 && 'lg:grid-cols-3')}>
      {packages.map((pkg) => {
        const bullets = pkg.features.filter((f) => f.showOnCard);
        return (
          <RevealItem
            key={pkg.id}
            className={cn(
              'relative flex flex-col overflow-hidden rounded-3xl border bg-white transition duration-300 hover:-translate-y-1',
              pkg.featured ? 'border-transparent shadow-lift ring-2 ring-gold-400 lg:-my-3' : 'border-line shadow-soft hover:shadow-lift',
            )}
          >
            <div className="relative px-7 pt-8 pb-7 text-white" style={{ background: `linear-gradient(135deg, ${pkg.color} 0%, color-mix(in srgb, ${pkg.color} 55%, #02112f) 100%)` }}>
              <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" aria-hidden />
              <div className="relative flex items-start justify-between gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
                  <Crown className="size-6" aria-hidden />
                </span>
                {pkg.badge && <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-navy-900 shadow">{pkg.badge}</span>}
              </div>
              <h3 className="relative mt-5 font-display text-3xl font-extrabold tracking-wide text-white uppercase">{pkg.name}</h3>
              <div className="relative mt-3">
                {pkg.priceLabel ? (
                  <p className="text-2xl font-bold">{pkg.priceLabel}</p>
                ) : (
                  <p className="text-lg font-semibold text-white/90">Pricing on request</p>
                )}
                {(pkg.pricingNote || pkg.billingLabel) && <p className="mt-1 text-sm text-white/80">{pkg.pricingNote ?? pkg.billingLabel}</p>}
              </div>
            </div>
            <div className="flex flex-1 flex-col p-7">
              {pkg.description && <p className="text-[15px] leading-relaxed text-slate-600">{pkg.description}</p>}
              <ul className="mt-6 flex-1 space-y-3">
                {bullets.map((feature) => (
                  <li key={feature.id} className="flex gap-3 text-[15px]">
                    {feature.availability === 'NOT_INCLUDED' ? (
                      <X className="mt-0.5 size-5 shrink-0 text-rose-500" aria-label="Not included" />
                    ) : (
                      <Check className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-label="Included" />
                    )}
                    <span className="text-slate-700">
                      <span className="font-medium text-navy-900">{feature.label}</span>
                      {feature.availability === 'CUSTOM' && feature.value && <span className="block text-sm text-slate-500">{feature.value}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full" variant={pkg.featured ? 'primary' : 'navy'} size="lg">
                <Link href={`/get-a-quote?package=${encodeURIComponent(pkg.name)}`}>Request {pkg.name} package</Link>
              </Button>
            </div>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
