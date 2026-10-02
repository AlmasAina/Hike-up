import { Injectable, NotFoundException } from '@nestjs/common';
import type { LegalPage as LegalRow } from '@prisma/client';
import type { LegalPage } from '@hikeup/types';
import { AuditService } from '../audit/audit.service';
import type { RequestMeta } from '../common/decorators/request-meta.decorator';
import { sanitizeRichText } from '../common/utils/sanitize';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateLegalPageDto } from './legal.dto';

const toLegal = (p: LegalRow): LegalPage => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  content: p.content,
  published: p.published,
  updatedAt: p.updatedAt.toISOString(),
});

@Injectable()
export class LegalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getPublished(slug: string): Promise<LegalPage> {
    const page = await this.prisma.legalPage.findFirst({ where: { slug, published: true } });
    if (!page) throw new NotFoundException('Page not found');
    return toLegal(page);
  }

  async list(): Promise<LegalPage[]> {
    return (await this.prisma.legalPage.findMany({ orderBy: { title: 'asc' } })).map(toLegal);
  }

  async update(id: string, dto: UpdateLegalPageDto, actorId: string, meta: RequestMeta): Promise<LegalPage> {
    const page = await this.prisma.legalPage.update({
      where: { id },
      data: {
        title: dto.title,
        published: dto.published,
        content: dto.content !== undefined ? sanitizeRichText(dto.content) : undefined,
      },
    });
    await this.audit.log({ actorId, action: 'legal.updated', entity: 'legal_pages', entityId: id, meta, metadata: { slug: page.slug } });
    return toLegal(page);
  }
}
