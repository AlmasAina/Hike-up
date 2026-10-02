import type { Prisma } from '@prisma/client';
import type { ServiceDetail, ServiceSummary } from '@hikeup/types';

export const serviceSummarySelect = {
  id: true,
  title: true,
  slug: true,
  shortDescription: true,
  icon: true,
  imageUrl: true,
  featured: true,
  sortOrder: true,
  status: true,
} satisfies Prisma.ServiceSelect;

export const serviceDetailInclude = {
  features: { orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }] },
  faqs: { orderBy: { sortOrder: 'asc' } },
  images: { orderBy: { sortOrder: 'asc' } },
} satisfies Prisma.ServiceInclude;

type ServiceWithDetail = Prisma.ServiceGetPayload<{ include: typeof serviceDetailInclude }>;

export function toServiceSummary(s: Prisma.ServiceGetPayload<{ select: typeof serviceSummarySelect }>): ServiceSummary {
  return { ...s };
}

export function toServiceDetail(s: ServiceWithDetail, related: ServiceSummary[] = []): ServiceDetail {
  return {
    id: s.id,
    title: s.title,
    slug: s.slug,
    shortDescription: s.shortDescription,
    icon: s.icon,
    imageUrl: s.imageUrl,
    featured: s.featured,
    sortOrder: s.sortOrder,
    status: s.status,
    imageKey: s.imageKey,
    introduction: s.introduction,
    description: s.description,
    seoTitle: s.seoTitle,
    seoDescription: s.seoDescription,
    ogImageUrl: s.ogImageUrl,
    features: s.features.map((f) => ({
      id: f.id,
      type: f.type,
      title: f.title,
      description: f.description,
      sortOrder: f.sortOrder,
    })),
    faqs: s.faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer, sortOrder: f.sortOrder })),
    images: s.images.map((i) => ({ id: i.id, url: i.url, key: i.key, alt: i.alt, sortOrder: i.sortOrder })),
    relatedServices: related,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}
