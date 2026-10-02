import { notFound } from 'next/navigation';
import { PageHero } from '@/components/sections/page-hero';
import { getLegalPage } from '@/lib/server-api';
import { formatDate } from '@/lib/utils';

/** Renders an admin-editable legal page (content is sanitised by the API). */
export async function LegalPageView({ slug }: { slug: string }) {
  const page = await getLegalPage(slug);
  if (!page) notFound();
  return (
    <>
      <PageHero title={page.title} subtitle={`Last updated ${formatDate(page.updatedAt)}`} crumbs={[{ label: page.title }]} />
      <section className="section bg-white">
        <article className="container-page max-w-3xl">
          <div className="rich-text text-[17px]" dangerouslySetInnerHTML={{ __html: page.content }} />
        </article>
      </section>
    </>
  );
}
