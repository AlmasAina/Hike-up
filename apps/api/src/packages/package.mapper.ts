import type { Prisma } from '@prisma/client';
import type { MaintenancePackage, PackageComparisonRow } from '@hikeup/types';

export const packageInclude = {
  features: { orderBy: { sortOrder: 'asc' } },
} satisfies Prisma.PackageInclude;

export function toPackage(p: Prisma.PackageGetPayload<{ include: typeof packageInclude }>): MaintenancePackage {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    badge: p.badge,
    color: p.color,
    billingLabel: p.billingLabel,
    priceLabel: p.priceLabel,
    pricingNote: p.pricingNote,
    includedHours: p.includedHours,
    sparePartsCoverage: p.sparePartsCoverage,
    freeLabour: p.freeLabour,
    preventiveVisits: p.preventiveVisits,
    maintenanceVisits: p.maintenanceVisits,
    featured: p.featured,
    active: p.active,
    sortOrder: p.sortOrder,
    features: p.features.map((f) => ({
      id: f.id,
      comparisonRowId: f.comparisonRowId,
      label: f.label,
      availability: f.availability,
      value: f.value,
      showOnCard: f.showOnCard,
      sortOrder: f.sortOrder,
    })),
  };
}

export function toComparisonRow(r: Prisma.PackageComparisonRowGetPayload<object>): PackageComparisonRow {
  return { id: r.id, label: r.label, description: r.description, icon: r.icon, sortOrder: r.sortOrder };
}
