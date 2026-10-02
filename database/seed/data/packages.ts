/**
 * Package structure based on the supplied HIKE UP "Property Maintenance Packages" artwork.
 * Pricing is intentionally NOT seeded — admins add it in Admin → Packages when ready.
 */

type Cell = { availability: 'INCLUDED' | 'NOT_INCLUDED' | 'CUSTOM'; value?: string };

export interface SeedComparisonRow {
  key: string;
  label: string;
  icon: string;
  values: Record<'bronze' | 'silver' | 'gold', Cell>;
}

const yes: Cell = { availability: 'INCLUDED' };
const no: Cell = { availability: 'NOT_INCLUDED' };
const text = (value: string): Cell => ({ availability: 'CUSTOM', value });

export const comparisonRows: SeedComparisonRow[] = [
  {
    key: 'inspection',
    label: 'Move-In & Move-Out Inspection',
    icon: 'clipboard-check',
    values: { bronze: yes, silver: yes, gold: yes },
  },
  {
    key: 'maintenance-247',
    label: '24/7 Maintenance Services',
    icon: 'clock',
    values: { bronze: yes, silver: yes, gold: yes },
  },
  {
    key: 'emergency',
    label: 'Emergency Maintenance',
    icon: 'siren',
    values: { bronze: yes, silver: yes, gold: yes },
  },
  {
    key: 'preventive-services',
    label: 'Preventive Maintenance Services',
    icon: 'settings',
    values: { bronze: yes, silver: yes, gold: yes },
  },
  {
    key: 'spare-parts',
    label: 'Spare Parts Coverage',
    icon: 'cog',
    values: {
      bronze: no,
      silver: text('Yes – up to 20% of contract value'),
      gold: text('Yes – up to 60% of contract value'),
    },
  },
  {
    key: 'free-labour',
    label: 'Free Labor',
    icon: 'hard-hat',
    values: { bronze: no, silver: yes, gold: yes },
  },
  {
    key: 'preventive-visits',
    label: 'Preventive Maintenance Visits',
    icon: 'calendar-clock',
    values: { bronze: text('3 Hours Free'), silver: text('3 Hours Free'), gold: text('3 Hours Free') },
  },
  {
    key: 'maintenance-visits',
    label: 'Maintenance Visits',
    icon: 'wrench',
    values: {
      bronze: text('20 Hours Free Total'),
      silver: text('30 Hours Free Total'),
      gold: text('Unlimited Hours Free'),
    },
  },
];

export interface SeedPackage {
  key: 'bronze' | 'silver' | 'gold';
  name: string;
  slug: string;
  description: string;
  badge: string | null;
  color: string;
  billingLabel: string;
  includedHours: string;
  sparePartsCoverage: string;
  freeLabour: boolean;
  preventiveVisits: string;
  maintenanceVisits: string;
  featured: boolean;
  /** Extra card bullets that are not part of the comparison table. */
  extraFeatures: string[];
}

export const packages: SeedPackage[] = [
  {
    key: 'bronze',
    name: 'Bronze',
    slug: 'bronze',
    description:
      'Essential cover for properties that need reliable inspections, emergency support and preventive maintenance.',
    badge: null,
    color: '#B5651D',
    billingLabel: 'Annual contract',
    includedHours: '20 hours free total',
    sparePartsCoverage: 'Not included',
    freeLabour: false,
    preventiveVisits: '3 hours free',
    maintenanceVisits: '20 hours free total',
    featured: false,
    extraFeatures: [],
  },
  {
    key: 'silver',
    name: 'Silver',
    slug: 'silver',
    description:
      'Everything in Bronze plus spare parts coverage, free labour and additional maintenance hours.',
    badge: 'Most Popular',
    color: '#8E9AAF',
    billingLabel: 'Annual contract',
    includedHours: '30 hours free total',
    sparePartsCoverage: 'Up to 20% of contract value',
    freeLabour: true,
    preventiveVisits: '3 hours free',
    maintenanceVisits: '30 hours free total',
    featured: true,
    extraFeatures: ['Everything in Bronze', 'Additional maintenance hours'],
  },
  {
    key: 'gold',
    name: 'Gold',
    slug: 'gold',
    description:
      'Our most comprehensive cover: higher spare parts coverage, free labour, unlimited maintenance hours and priority service.',
    badge: 'Best Value',
    color: '#F5A800',
    billingLabel: 'Annual contract',
    includedHours: 'Unlimited hours free',
    sparePartsCoverage: 'Up to 60% of contract value',
    freeLabour: true,
    preventiveVisits: '3 hours free',
    maintenanceVisits: 'Unlimited hours free',
    featured: false,
    extraFeatures: ['Everything in Silver', 'Priority service'],
  },
];
