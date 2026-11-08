import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { ServiceSummary } from '@hikeup/types';
import { SmartImage } from '@/components/smart-image';
import { DynamicIcon } from '@/lib/icons';

export function ServiceCard({ service, priority = false }: { service: ServiceSummary; priority?: boolean }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-navy-900">
        {service.imageUrl ? (
          <SmartImage
            src={service.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            quality={90}
            priority={priority}
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-hero" />
        )}
        <span className="absolute top-4 left-4 grid size-12 place-items-center rounded-2xl bg-gold-500 text-navy-950 shadow-gold">
          <DynamicIcon name={service.icon} className="size-6" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold text-navy-900">{service.title}</h3>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-slate-600">{service.shortDescription}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-navy-700 transition group-hover:gap-2.5 group-hover:text-gold-600">
          Explore service <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
