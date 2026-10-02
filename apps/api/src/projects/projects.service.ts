import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Paginated, Project } from '@hikeup/types';
import { AuditService } from '../audit/audit.service';
import type { RequestMeta } from '../common/decorators/request-meta.decorator';
import { paginate, skipTake } from '../common/utils/pagination';
import { sanitizeRichText } from '../common/utils/sanitize';
import { archivedSlug, normalizeSlug } from '../common/utils/slug';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import type { CreateProjectDto, ProjectQueryDto, UpdateProjectDto } from './project.dto';

const include = {
  images: { orderBy: { sortOrder: 'asc' } },
  service: { select: { id: true, title: true, slug: true } },
} satisfies Prisma.ProjectInclude;

type ProjectRecord = Prisma.ProjectGetPayload<{ include: typeof include }>;

function toProject(p: ProjectRecord): Project {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    location: p.location,
    summary: p.summary,
    description: p.description,
    completedAt: p.completedAt?.toISOString().slice(0, 10) ?? null,
    status: p.status,
    isDemo: p.isDemo,
    sortOrder: p.sortOrder,
    service: p.service,
    images: p.images.map((i) => ({ id: i.id, url: i.url, key: i.key, alt: i.alt, sortOrder: i.sortOrder })),
    coverImageUrl: p.images[0]?.url ?? null,
  };
}

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
  ) {}

  private where(query: ProjectQueryDto, publicOnly: boolean): Prisma.ProjectWhereInput {
    return {
      deletedAt: null,
      ...(publicOnly ? { status: 'PUBLISHED' } : query.status ? { status: query.status } : {}),
      ...(query.service ? { service: { slug: query.service } } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { location: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }

  async list(query: ProjectQueryDto, publicOnly: boolean): Promise<Paginated<Project>> {
    const where = this.where(query, publicOnly);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        include,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: query.order }],
        ...skipTake(query.page, query.pageSize),
      }),
      this.prisma.project.count({ where }),
    ]);
    return paginate(rows.map(toProject), total, query.page, query.pageSize);
  }

  async getPublishedBySlug(slug: string): Promise<Project> {
    const project = await this.prisma.project.findFirst({ where: { slug, status: 'PUBLISHED', deletedAt: null }, include });
    if (!project) throw new NotFoundException('Project not found');
    return toProject(project);
  }

  async adminGet(id: string): Promise<Project> {
    const project = await this.prisma.project.findFirst({ where: { id, deletedAt: null }, include });
    if (!project) throw new NotFoundException('Project not found');
    return toProject(project);
  }

  async create(dto: CreateProjectDto, actorId: string, meta: RequestMeta): Promise<Project> {
    const project = await this.prisma.project.create({
      data: {
        title: dto.title,
        slug: normalizeSlug(dto.slug, dto.title),
        location: dto.location ?? null,
        summary: dto.summary ?? null,
        description: sanitizeRichText(dto.description),
        serviceId: dto.serviceId ?? null,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
        status: dto.status ?? 'DRAFT',
        sortOrder: dto.sortOrder ?? (await this.prisma.project.count({ where: { deletedAt: null } })),
        images: dto.images
          ? { create: dto.images.map((img, i) => ({ url: img.url, key: img.key ?? null, alt: img.alt ?? dto.title, sortOrder: i })) }
          : undefined,
      },
      include,
    });
    await this.audit.log({ actorId, action: 'project.created', entity: 'projects', entityId: project.id, meta, metadata: { title: project.title } });
    return toProject(project);
  }

  async update(id: string, dto: UpdateProjectDto, actorId: string, meta: RequestMeta): Promise<Project> {
    const existing = await this.prisma.project.findFirst({ where: { id, deletedAt: null }, include: { images: true } });
    if (!existing) throw new NotFoundException('Project not found');
    const removedKeys: string[] = [];
    if (dto.images) {
      const keep = new Set(dto.images.map((i) => i.key).filter(Boolean));
      existing.images.forEach((img) => img.key && !keep.has(img.key) && removedKeys.push(img.key));
    }
    const project = await this.prisma.$transaction(async (tx) => {
      if (dto.images) await tx.projectImage.deleteMany({ where: { projectId: id } });
      return tx.project.update({
        where: { id },
        data: {
          title: dto.title,
          slug: dto.slug !== undefined ? normalizeSlug(dto.slug, dto.title ?? existing.title) : undefined,
          location: dto.location,
          summary: dto.summary,
          description: dto.description !== undefined ? sanitizeRichText(dto.description) : undefined,
          serviceId: dto.serviceId,
          completedAt: dto.completedAt === undefined ? undefined : dto.completedAt ? new Date(dto.completedAt) : null,
          status: dto.status,
          sortOrder: dto.sortOrder,
          images: dto.images
            ? { create: dto.images.map((img, i) => ({ url: img.url, key: img.key ?? null, alt: img.alt ?? null, sortOrder: i })) }
            : undefined,
        },
        include,
      });
    });
    await Promise.all(removedKeys.map((k) => this.storage.delete(k)));
    await this.audit.log({ actorId, action: 'project.updated', entity: 'projects', entityId: id, meta, metadata: { fields: Object.keys(dto) } });
    return toProject(project);
  }

  async remove(id: string, actorId: string, meta: RequestMeta): Promise<void> {
    const existing = await this.prisma.project.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Project not found');
    await this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DRAFT', slug: archivedSlug(existing.slug) },
    });
    await this.audit.log({ actorId, action: 'project.deleted', entity: 'projects', entityId: id, meta, metadata: { title: existing.title } });
  }
}
