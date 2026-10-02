import { BadgeCheck, Building2, Clock, ShieldCheck, Wrench } from 'lucide-react';
import type { PublicSettings } from '@hikeup/types';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';

export function TrustBadges({ settings }: { settings: PublicSettings }) {
  const badges = [
    { Icon: Clock, title: settings.workingHours?.includes('24/7') ? '24/7 Support' : 'Responsive Support', text: 'Emergencies prioritised' },
    { Icon: Building2, title: 'Residential & Commercial', text: 'Villas, apartments, offices' },
    { Icon: Wrench, title: 'Multi-Trade Team', text: 'One call for every job' },
    { Icon: ShieldCheck, title: 'Preventive Plans', text: 'Bronze · Silver · Gold' },
    ...(settings.showLicenceNumber && settings.licenceNumber
      ? [{ Icon: BadgeCheck, title: 'Licensed in Abu Dhabi', text: `Trade Licence ${settings.licenceNumber}` }]
      : []),
  ];
  return (
    <section aria-label="Why customers choose us" className="relative z-10 -mt-2 bg-white">
      <div className="container-page">
        <RevealGroup className="grid grid-cols-2 gap-3 py-8 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {badges.map(({ Icon, title, text }) => (
            <RevealItem key={title} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-soft sm:p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-navy-900">{title}</span>
                <span className="block truncate text-xs text-slate-500">{text}</span>
              </span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
