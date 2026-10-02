import { CalendarDays, MapPin, Wrench } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/motion/reveal';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { ProjectGallery } from '@/components/sections/project-gallery';
import { Badge } from '@/components/ui/badge';
import { pageMetadata } from '@/lib/seo';
import { getProject, getSettings } from '@/lib/server-api';
import { formatDate } from '@/lib/utils';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: 'Project not found' };
  return pageMetadata({
    title: project.title,
    description: project.summary ?? undefined,
    path: `/projects/${project.slug}`,
    image: project.coverImageUrl && !project.coverImageUrl.endsWith('.svg') ? project.coverImageUrl : null,
    noIndex: project.isDemo,
  });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([getProject(slug), getSettings()]);
  if (!project) notFound();

  return (
    <>
      <PageHero title={project.title} subtitle={project.summary} crumbs={[{ label: 'Projects', href: '/projects' }, { label: project.title }]} />
      <section className="section bg-white">
        <div className="container-page grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            {project.isDemo && (
              <p className="mb-6 rounded-2xl bg-amber-50 px-5 py-4 text-sm text-amber-900 ring-1 ring-amber-200">
                This is demonstration content that illustrates how projects are presented. It is not a completed customer project.
              </p>
            )}
            <ProjectGallery images={project.images} title={project.title} />
            <Reveal className="mt-10">
              <div className="rich-text text-lg" dangerouslySetInnerHTML={{ __html: project.description }} />
            </Reveal>
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <dl className="space-y-5 rounded-3xl border border-line bg-surface p-7">
              {project.service && (
                <div>
                  <dt className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    <Wrench className="size-4" aria-hidden /> Service
                  </dt>
                  <dd className="mt-1">
                    <Link href={`/services/${project.service.slug}`} className="font-bold text-navy-800 hover:underline">
                      {project.service.title}
                    </Link>
                  </dd>
                </div>
              )}
              {project.location && (
                <div>
                  <dt className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    <MapPin className="size-4" aria-hidden /> Location
                  </dt>
                  <dd className="mt-1 font-bold text-navy-900">{project.location}</dd>
                </div>
              )}
              {project.completedAt && (
                <div>
                  <dt className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    <CalendarDays className="size-4" aria-hidden /> Completed
                  </dt>
                  <dd className="mt-1 font-bold text-navy-900">{formatDate(project.completedAt)}</dd>
                </div>
              )}
              {project.isDemo && <Badge>Demo content</Badge>}
            </dl>
          </aside>
        </div>
      </section>
      <CtaBand settings={settings} title="Have a similar job?" />
    </>
  );
}
