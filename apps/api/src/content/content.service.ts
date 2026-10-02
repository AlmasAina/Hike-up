import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type ContentSection as ContentRow } from '@prisma/client';
import type { ContentItem, ContentSection } from '@hikeup/types';
import { AuditService } from '../audit/audit.service';
import type { RequestMeta } from '../common/decorators/request-meta.decorator';
import { sanitizeRichText } from '../common/utils/sanitize';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import type { UpdateContentSectionDto } from './content.dto';

/** Keys that the website renders. Admins edit these; new keys are added through seeds/migrations. */
export const CONTENT_KEYS = [
  'home.hero',
  'home.why_choose',
  'home.how_it_works',
  'about.intro',
  'about.mission',
  'about.vision',
  'about.values',
  'about.approach',
  'about.why_trust',
] as const;

const toSection = (s: ContentRow): ContentSection => ({
  id: s.id,
  key: s.key,
  title: s.title,
  subtitle: s.subtitle,
  body: s.body,
  imageUrl: s.imageUrl,
  imageKey: s.imageKey,
  items: Array.isArray(s.items) ? (s.items as unknown as ContentItem[]) : [],
  updatedAt: s.updatedAt.toISOString(),
});

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
  ) {}

  /** Returns sections keyed by `key`. Optionally limited to a prefix such as "about.". */
  async getMap(prefix?: string): Promise<Record<string, ContentSection>> {
    const rows = await this.prisma.contentSection.findMany({
      where: prefix ? { key: { startsWith: prefix } } : undefined,
      orderBy: { key: 'asc' },
    });
    return Object.fromEntries(rows.map((r) => [r.key, toSection(r)]));
  }

  async list(): Promise<ContentSection[]> {
    const rows = await this.prisma.contentSection.findMany({ orderBy: { key: 'asc' } });
    return rows.map(toSection);
  }

  async update(key: string, dto: UpdateContentSectionDto, actorId: string, meta: RequestMeta): Promise<ContentSection> {
    const existing = await this.prisma.contentSection.findUnique({ where: { key } });
    if (!existing && !(CONTENT_KEYS as readonly string[]).includes(key)) {
      throw new NotFoundException('Unknown content section');
    }
    const data = {
      title: dto.title,
      subtitle: dto.subtitle,
      body: dto.body === undefined ? undefined : dto.body ? sanitizeRichText(dto.body) : null,
      imageUrl: dto.imageUrl,
      imageKey: dto.imageKey,
      items: dto.items ? (dto.items as unknown as Prisma.InputJsonValue) : undefined,
    };
    const row = await this.prisma.contentSection.upsert({
      where: { key },
      update: data,
      create: { key, ...data, items: (dto.items ?? []) as unknown as Prisma.InputJsonValue },
    });
    if (existing?.imageKey && dto.imageKey !== undefined && dto.imageKey !== existing.imageKey) {
      await this.storage.delete(existing.imageKey);
    }
    await this.audit.log({ actorId, action: 'content.updated', entity: 'content_sections', entityId: key, meta, metadata: { fields: Object.keys(dto) } });
    return toSection(row);
  }
}
