import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type Testimonial as TestimonialRow } from '@prisma/client';
import type { Paginated, Testimonial } from '@hikeup/types';
import { AuditService } from '../audit/audit.service';
import type { RequestMeta } from '../common/decorators/request-meta.decorator';
import { paginate, skipTake } from '../common/utils/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import type { CreateTestimonialDto, TestimonialQueryDto, UpdateTestimonialDto } from './testimonial.dto';

const toTestimonial = (t: TestimonialRow): Testimonial => ({
  id: t.id,
  name: t.name,
  company: t.company,
  rating: t.rating,
  review: t.review,
  imageUrl: t.imageUrl,
  imageKey: t.imageKey,
  status: t.status,
  isSample: t.isSample,
  sortOrder: t.sortOrder,
});

@Injectable()
export class TestimonialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
  ) {}

  async listPublished(): Promise<Testimonial[]> {
    const rows = await this.prisma.testimonial.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return rows.map(toTestimonial);
  }

  async adminList(query: TestimonialQueryDto): Promise<Paginated<Testimonial>> {
    const where: Prisma.TestimonialWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? { OR: [{ name: { contains: query.search, mode: 'insensitive' } }, { company: { contains: query.search, mode: 'insensitive' } }] }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.testimonial.findMany({ where, orderBy: [{ sortOrder: 'asc' }, { createdAt: query.order }], ...skipTake(query.page, query.pageSize) }),
      this.prisma.testimonial.count({ where }),
    ]);
    return paginate(rows.map(toTestimonial), total, query.page, query.pageSize);
  }

  async adminGet(id: string): Promise<Testimonial> {
    const row = await this.prisma.testimonial.findFirst({ where: { id, deletedAt: null } });
    if (!row) throw new NotFoundException('Testimonial not found');
    return toTestimonial(row);
  }

  async create(dto: CreateTestimonialDto, actorId: string, meta: RequestMeta): Promise<Testimonial> {
    const row = await this.prisma.testimonial.create({
      data: {
        ...dto,
        isSample: dto.isSample ?? false,
        sortOrder: dto.sortOrder ?? (await this.prisma.testimonial.count({ where: { deletedAt: null } })),
      },
    });
    await this.audit.log({ actorId, action: 'testimonial.created', entity: 'testimonials', entityId: row.id, meta });
    return toTestimonial(row);
  }

  async update(id: string, dto: UpdateTestimonialDto, actorId: string, meta: RequestMeta): Promise<Testimonial> {
    const existing = await this.prisma.testimonial.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Testimonial not found');
    const row = await this.prisma.testimonial.update({ where: { id }, data: dto });
    if (dto.imageKey !== undefined && existing.imageKey && existing.imageKey !== dto.imageKey) {
      await this.storage.delete(existing.imageKey);
    }
    await this.audit.log({ actorId, action: 'testimonial.updated', entity: 'testimonials', entityId: id, meta, metadata: { fields: Object.keys(dto) } });
    return toTestimonial(row);
  }

  async remove(id: string, actorId: string, meta: RequestMeta): Promise<void> {
    const existing = await this.prisma.testimonial.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Testimonial not found');
    await this.prisma.testimonial.update({ where: { id }, data: { deletedAt: new Date(), status: 'DRAFT' } });
    await this.audit.log({ actorId, action: 'testimonial.deleted', entity: 'testimonials', entityId: id, meta });
  }
}
