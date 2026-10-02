import { Check, X } from 'lucide-react';
import type { MaintenancePackage, PackageComparisonRow, PackageFeature } from '@hikeup/types';
import { DynamicIcon } from '@/lib/icons';

function Cell({ feature }: { feature?: PackageFeature }) {
  if (!feature) return <span className="text-slate-400" aria-label="Not specified">—</span>;
  if (feature.availability === 'INCLUDED')
    return (
      <span className="inline-grid size-8 place-items-center rounded-full bg-emerald-50 text-emerald-600">
        <Check className="size-5" strokeWidth={3} aria-label="Included" />
      </span>
    );
  if (feature.availability === 'NOT_INCLUDED')
    return (
      <span className="inline-grid size-8 place-items-center rounded-full bg-rose-50 text-rose-500">
        <X className="size-5" strokeWidth={3} aria-label="Not included" />
      </span>
    );
  return <span className="text-sm font-semibold text-navy-800">{feature.value}</span>;
}

/**
 * Responsive comparison: a real <table> on desktop, stacked cards on mobile.
 * Availability (✓ / ✕ / custom text) is controlled per package in the admin panel.
 */
export function ComparisonTable({ packages, rows }: { packages: MaintenancePackage[]; rows: PackageComparisonRow[] }) {
  if (!packages.length || !rows.length) return null;
  const lookup = (pkg: MaintenancePackage, rowId: string) => pkg.features.find((f) => f.comparisonRowId === rowId);

  return (
    <>
      <div className="hidden overflow-hidden rounded-3xl border border-line bg-white shadow-soft md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Maintenance package comparison</caption>
          <thead>
            <tr>
              <th scope="col" className="bg-navy-800 px-6 py-5 text-base font-bold tracking-wide text-white uppercase">
                Service
              </th>
              {packages.map((pkg) => (
                <th
                  key={pkg.id}
                  scope="col"
                  className="px-6 py-5 text-center font-display text-xl font-extrabold tracking-wider text-white uppercase"
                  style={{ background: pkg.color }}
                >
                  {pkg.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id} className={i % 2 ? 'bg-surface' : 'bg-white'}>
                <th scope="row" className="px-6 py-4 font-semibold text-navy-900">
                  <span className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700">
                      <DynamicIcon name={row.icon} className="size-[18px]" />
                    </span>
                    {row.label}
                  </span>
                </th>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="border-l border-line px-6 py-4 text-center">
                    <Cell feature={lookup(pkg, row.id)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-5 md:hidden">
        {packages.map((pkg) => (
          <section key={pkg.id} className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft" aria-label={`${pkg.name} package`}>
            <h3 className="px-5 py-4 font-display text-xl font-extrabold tracking-wider text-white uppercase" style={{ background: pkg.color }}>
              {pkg.name}
            </h3>
            <dl className="divide-y divide-line">
              {rows.map((row) => (
                <div key={row.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <dt className="text-sm font-medium text-slate-700">{row.label}</dt>
                  <dd className="shrink-0 text-right">
                    <Cell feature={lookup(pkg, row.id)} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </>
  );
}
