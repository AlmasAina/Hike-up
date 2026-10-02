import { CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';
import type { Project } from '@hikeup/types';
import { SmartImage } from '@/components/smart-image';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-900">
        {project.coverImageUrl && (
          <SmartImage
            src={project.coverImageUrl}
            alt={project.images[0]?.alt ?? project.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy-950/70 to-transparent" aria-hidden />
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {project.service && <Badge variant="gold">{project.service.title}</Badge>}
          {project.isDemo && <Badge variant="neutral">Demo content</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-bold text-navy-900 group-hover:text-navy-700">{project.title}</h3>
        {project.summary && <p className="mt-2 line-clamp-2 flex-1 text-[15px] text-slate-600">{project.summary}</p>}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          {project.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden /> {project.location}
            </span>
          )}
          {project.completedAt && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden /> {formatDate(project.completedAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
