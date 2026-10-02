import { slugify } from '@hikeup/ui';

/** Returns a slug for a soft-deleted record so the original slug can be reused. */
export function archivedSlug(slug: string): string {
  return `${slug}--deleted-${Date.now().toString(36)}`.slice(0, 180);
}

export function normalizeSlug(value: string | undefined, fallbackTitle: string): string {
  const slug = slugify(value?.trim() || fallbackTitle);
  return slug || `item-${Date.now().toString(36)}`;
}
