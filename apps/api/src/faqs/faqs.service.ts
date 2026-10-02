import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type Faq as FaqRow } from '@prisma/client';
import type { Faq, Paginated } from '@hikeup/types';
import { AuditService } from '../audit/audit.service';
import type { RequestMeta } from '../common/decorators/request-meta.decorator';
import { paginate, skipTake } from '../common/utils/pagination';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateFaqDto, FaqQueryDto, UpdateFaqDto } from './faq.dto';

const toFaq = (f: FaqRow): Faq => ({
  id: f.id,
  question: f.question,
  answer: f.answer,
  category: f.category,
  sortOrder: f.sortOrder,
  status: f.status,
});

@Injectable()
export class FaqsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listPublished(category?: string): Promise<Faq[]> {
    const rows = await this.prisma.faq.findMany({
      where: { status: 'PUBLISHED', deletedAt: null, ...(category ? { category } : {}) },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map(toFaq);
  }

  async adminList(query: FaqQueryDto): Promise<Paginated<Faq>> {
    const where: Prisma.FaqWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.search
        ? { OR: [{ question: { contains: query.search, mode: 'insensitive' } }, { answer: { contains: query.search, mode: 'insensitive' } }] }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.faq.findMany({ where, orderBy: [{ sortOrder: 'asc' }, { createdAt: query.order }], ...skipTake(query.page, query.pageSize) }),
      this.prisma.faq.count({ where }),
    ]);
    return paginate(rows.map(toFaq), total, query.page, query.pageSize);
  }

  async adminGet(id: string): Promise<Faq> {
    const row = await this.prisma.faq.findFirst({ where: { id, deletedAt: null } });
    if (!row) throw new NotFoundException('FAQ not found');
    return toFaq(row);
  }

  async create(dto: CreateFaqDto, actorId: string, meta: RequestMeta): Promise<Faq> {
    const row = await this.prisma.faq.create({
      data: { ...dto, sortOrder: dto.sortOrder ?? (await this.prisma.faq.count({ where: { deletedAt: null } })) },
    });
    await this.audit.log({ actorId, action: 'faq.created', entity: 'faqs', entityId: row.id, meta });
    return toFaq(row);
  }

  async update(id: string, dto: UpdateFaqDto, actorId: string, meta: RequestMeta): Promise<Faq> {
    await this.adminGet(id);
    const row = await this.prisma.faq.update({ where: { id }, data: dto });
    await this.audit.log({ actorId, action: 'faq.updated', entity: 'faqs', entityId: id, meta, metadata: { fields: Object.keys(dto) } });
    return toFaq(row);
  }

  async remove(id: string, actorId: string, meta: RequestMeta): Promise<void> {
    await this.adminGet(id);
    await this.prisma.faq.update({ where: { id }, data: { deletedAt: new Date(), status: 'DRAFT' } });
    await this.audit.log({ actorId, action: 'faq.deleted', entity: 'faqs', entityId: id, meta });
  }
}
