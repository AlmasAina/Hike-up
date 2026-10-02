import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Paginated, ServiceDetail, ServiceSummary } from '@hikeup/types';
import { AuditService } from '../audit/audit.service';
import type { RequestMeta } from '../common/decorators/request-meta.decorator';
import { paginate, skipTake } from '../common/utils/pagination';
import { sanitizeRichText } from '../common/utils/sanitize';
import { archivedSlug, normalizeSlug } from '../common/utils/slug';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import type { CreateServiceDto, ServiceQueryDto, UpdateServiceDto } from './dto/service.dto';
import { serviceDetailInclude, serviceSummarySelect, toServiceDetail, toServiceSummary } from './service.mapper';

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
  ) {}

  // ───────────────────────────── public ──

  async listPublished(): Promise<ServiceSummary[]> {
    const rows = await this.prisma.service.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      select: serviceSummarySelect,
    });
    return rows.map(toServiceSummary);
  }

  async getPublishedBySlug(slug: string): Promise<ServiceDetail> {
    const service = await this.prisma.service.findFirst({
      where: { slug, status: 'PUBLISHED', deletedAt: null },
      include: serviceDetailInclude,
    });
    if (!service) throw new NotFoundException('Service not found');
    const related = await this.prisma.service.findMany({
      where: { status: 'PUBLISHED', deletedAt: null, id: { not: service.id } },
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
      take: 3,
      select: serviceSummarySelect,
    });
    return toServiceDetail(service, related.map(toServiceSummary));
  }

  // ────────────────────────────── admin ──

  async adminList(query: ServiceQueryDto): Promise<Paginated<ServiceSummary & { updatedAt: string }>> {
    const where: Prisma.ServiceWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { slug: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: query.order }],
        ...skipTake(query.page, query.pageSize),
        select: { ...serviceSummarySelect, updatedAt: true },
      }),
      this.prisma.service.count({ where }),
    ]);
    return paginate(
      rows.map((r) => ({ ...toServiceSummary(r), updatedAt: r.updatedAt.toISOString() })),
      total,
      query.page,
      query.pageSize,
    );
  }

  async adminGet(id: string): Promise<ServiceDetail> {
    const service = await this.prisma.service.findFirst({ where: { id, deletedAt: null }, include: serviceDetailInclude });
    if (!service) throw new NotFoundException('Service not found');
    return toServiceDetail(service);
  }

  async create(dto: CreateServiceDto, actorId: string, meta: RequestMeta): Promise<ServiceDetail> {
    const sortOrder = dto.sortOrder ?? (await this.prisma.service.count({ where: { deletedAt: null } }));
    const service = await this.prisma.service.create({
      data: {
        title: dto.title,
        slug: normalizeSlug(dto.slug, dto.title),
        shortDescription: dto.shortDescription,
        introduction: dto.introduction ?? null,
        description: sanitizeRichText(dto.description),
        icon: dto.icon ?? 'wrench',
        imageUrl: dto.imageUrl ?? null,
        imageKey: dto.imageKey ?? null,
        ogImageUrl: dto.ogImageUrl ?? null,
        seoTitle: dto.seoTitle ?? null,
        seoDescription: dto.seoDescription ?? null,
        status: dto.status ?? 'DRAFT',
        featured: dto.featured ?? false,
        sortOrder,
        features: dto.features
          ? { create: dto.features.map((f, i) => ({ ...f, description: f.description ?? null, sortOrder: i })) }
          : undefined,
        faqs: dto.faqs ? { create: dto.faqs.map((f, i) => ({ ...f, sortOrder: i })) } : undefined,
        images: dto.images
          ? { create: dto.images.map((img, i) => ({ url: img.url, key: img.key ?? null, alt: img.alt ?? null, sortOrder: i })) }
          : undefined,
      },
      include: serviceDetailInclude,
    });
    await this.audit.log({ actorId, action: 'service.created', entity: 'services', entityId: service.id, meta, metadata: { title: service.title } });
    return toServiceDetail(service);
  }

  async update(id: string, dto: UpdateServiceDto, actorId: string, meta: RequestMeta): Promise<ServiceDetail> {
    const existing = await this.prisma.service.findFirst({ where: { id, deletedAt: null }, include: { images: true } });
    if (!existing) throw new NotFoundException('Service not found');

    const removedKeys: string[] = [];
    if (dto.imageKey !== undefined && existing.imageKey && existing.imageKey !== dto.imageKey) removedKeys.push(existing.imageKey);
    if (dto.images) {
      const keep = new Set(dto.images.map((i) => i.key).filter(Boolean));
      existing.images.forEach((img) => img.key && !keep.has(img.key) && removedKeys.push(img.key));
    }

    const service = await this.prisma.$transaction(async (tx) => {
      if (dto.features) await tx.serviceFeature.deleteMany({ where: { serviceId: id } });
      if (dto.faqs) await tx.serviceFaq.deleteMany({ where: { serviceId: id } });
      if (dto.images) await tx.serviceImage.deleteMany({ where: { serviceId: id } });
      return tx.service.update({
        where: { id },
        data: {
          title: dto.title,
          slug: dto.slug !== undefined ? normalizeSlug(dto.slug, dto.title ?? existing.title) : undefined,
          shortDescription: dto.shortDescription,
          introduction: dto.introduction,
          description: dto.description !== undefined ? sanitizeRichText(dto.description) : undefined,
          icon: dto.icon,
          imageUrl: dto.imageUrl,
          imageKey: dto.imageKey,
          ogImageUrl: dto.ogImageUrl,
          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
          status: dto.status,
          featured: dto.featured,
          sortOrder: dto.sortOrder,
          features: dto.features
            ? { create: dto.features.map((f, i) => ({ ...f, description: f.description ?? null, sortOrder: i })) }
            : undefined,
          faqs: dto.faqs ? { create: dto.faqs.map((f, i) => ({ ...f, sortOrder: i })) } : undefined,
          images: dto.images
            ? { create: dto.images.map((img, i) => ({ url: img.url, key: img.key ?? null, alt: img.alt ?? null, sortOrder: i })) }
            : undefined,
        },
        include: serviceDetailInclude,
      });
    });
    await Promise.all(removedKeys.map((key) => this.storage.delete(key)));
    await this.audit.log({
      actorId,
      action: dto.status && dto.status !== existing.status ? `service.${dto.status.toLowerCase()}` : 'service.updated',
      entity: 'services',
      entityId: id,
      meta,
      metadata: { fields: Object.keys(dto) },
    });
    return toServiceDetail(service);
  }

  async remove(id: string, actorId: string, meta: RequestMeta): Promise<void> {
    const existing = await this.prisma.service.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Service not found');
    await this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DRAFT', slug: archivedSlug(existing.slug) },
    });
    await this.audit.log({ actorId, action: 'service.deleted', entity: 'services', entityId: id, meta, metadata: { title: existing.title } });
  }

  async reorder(ids: string[], actorId: string, meta: RequestMeta): Promise<void> {
    await this.prisma.$transaction(ids.map((id, index) => this.prisma.service.update({ where: { id }, data: { sortOrder: index } })));
    await this.audit.log({ actorId, action: 'service.reordered', entity: 'services', meta });
  }
}
