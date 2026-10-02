import type { Metadata } from 'next';
import Link from 'next/link';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { ProjectCard } from '@/components/sections/project-card';
import { EmptyState } from '@/components/ui/feedback';
import { pageMetadata } from '@/lib/seo';
import { getProjects, getServices, getSettings } from '@/lib/server-api';
import { cn } from '@/lib/utils';

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: 'Projects',
  description: 'Maintenance projects delivered by HIKE UP General Maintenance for homes and businesses.',
  path: '/projects',
});

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const [projects, allProjects, services, settings] = await Promise.all([getProjects(service), getProjects(), getServices(), getSettings()]);
  const categories = services.filter((s) => allProjects.some((p) => p.service?.id === s.id));

  return (
    <>
      <PageHero title="Our Projects" subtitle="Examples of the maintenance work we deliver across residential and commercial properties." crumbs={[{ label: 'Projects' }]} />
      <section className="section bg-surface">
        <div className="container-page">
          {categories.length > 0 && (
            <nav aria-label="Filter projects by service" className="mb-10 flex flex-wrap gap-2">
              {[{ slug: undefined, title: 'All projects' }, ...categories].map((c) => {
                const active = c.slug === service;
                return (
                  <Link
                    key={c.title}
                    href={c.slug ? `/projects?service=${c.slug}` : '/projects'}
                    scroll={false}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-semibold ring-1 transition',
                      active ? 'bg-navy-800 text-white ring-navy-800' : 'bg-white text-slate-700 ring-line hover:ring-navy-300',
                    )}
                  >
                    {c.title}
                  </Link>
                );
              })}
            </nav>
          )}
          {projects.length ? (
            <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <RevealItem key={project.id}>
                  <ProjectCard project={project} />
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <EmptyState title="Project showcase coming soon" description="We are preparing case studies of our recent work. In the meantime, contact us to discuss your project." />
          )}
        </div>
      </section>
      <CtaBand settings={settings} />
    </>
  );
}
