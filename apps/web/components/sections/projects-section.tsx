import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Project } from '@hikeup/types';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { ProjectCard } from './project-card';
import { SectionHeading } from './section-heading';

export function ProjectsSection({ projects }: { projects: Project[] }) {
  if (!projects.length) return null;
  return (
    <section className="section bg-white" aria-labelledby="projects-heading">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading id="projects-heading" align="left" eyebrow="Our work" title="Recent projects" subtitle="A look at maintenance work delivered for homes and businesses." />
          <Button asChild variant="outline">
            <Link href="/projects">
              View all projects <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
        <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 3).map((project) => (
            <RevealItem key={project.id}>
              <ProjectCard project={project} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
