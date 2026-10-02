import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Paginated, TechnicianSummary } from '@hikeup/types';
import { AuditService } from '../audit/audit.service';
import { PasswordService } from '../auth/password.service';
import { TokenService } from '../auth/token.service';
import type { RequestMeta } from '../common/decorators/request-meta.decorator';
import { paginate, skipTake } from '../common/utils/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { toTechnicianSummary } from '../quote-requests/quote-request.mapper';
import { StorageService } from '../storage/storage.service';
import type { CreateTechnicianDto, TechnicianQueryDto, UpdateTechnicianDto } from './technician.dto';

const ACTIVE_STATUSES = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'QUOTED', 'APPROVED'] as const;

@Injectable()
export class TechniciansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
    private readonly audit: AuditService,
  ) {}

  async list(query: TechnicianQueryDto): Promise<Paginated<TechnicianSummary>> {
    const where: Prisma.TechnicianWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search } },
              { skills: { has: query.search } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.technician.findMany({
        where,
        orderBy: { name: 'asc' },
        ...skipTake(query.page, query.pageSize),
        include: {
          _count: { select: { assignments: { where: { request: { status: { in: [...ACTIVE_STATUSES] }, deletedAt: null } } } } },
        },
      }),
      this.prisma.technician.count({ where }),
    ]);
    return paginate(rows.map((t) => toTechnicianSummary(t, t._count.assignments)), total, query.page, query.pageSize);
  }

  async get(id: string): Promise<TechnicianSummary> {
    const tech = await this.prisma.technician.findFirst({ where: { id, deletedAt: null } });
    if (!tech) throw new NotFoundException('Technician not found');
    return toTechnicianSummary(tech);
  }

  async create(dto: CreateTechnicianDto, actorId: string, meta: RequestMeta): Promise<TechnicianSummary> {
    const tech = await this.prisma.technician.create({
      data: { ...dto, email: dto.email?.toLowerCase() ?? null, skills: dto.skills ?? [] },
    });
    await this.audit.log({ actorId, action: 'technician.created', entity: 'technicians', entityId: tech.id, meta, metadata: { name: tech.name } });
    return toTechnicianSummary(tech);
  }

  async update(id: string, dto: UpdateTechnicianDto, actorId: string, meta: RequestMeta): Promise<TechnicianSummary> {
    const existing = await this.prisma.technician.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Technician not found');
    const tech = await this.prisma.technician.update({
      where: { id },
      data: { ...dto, email: dto.email === undefined ? undefined : (dto.email?.toLowerCase() ?? null) },
    });
    if (dto.imageKey !== undefined && existing.imageKey && existing.imageKey !== dto.imageKey) {
      await this.storage.delete(existing.imageKey);
    }
    // Keep the linked login in sync with the technician status.
    if (dto.status && existing.userId) {
      await this.prisma.user.update({
        where: { id: existing.userId },
        data: { status: dto.status === 'ACTIVE' ? 'ACTIVE' : 'DISABLED' },
      });
      if (dto.status === 'INACTIVE') await this.tokens.revokeAllForUser(existing.userId);
    }
    await this.audit.log({ actorId, action: 'technician.updated', entity: 'technicians', entityId: id, meta, metadata: { fields: Object.keys(dto) } });
    return toTechnicianSummary(tech);
  }

  async remove(id: string, actorId: string, meta: RequestMeta): Promise<void> {
    const existing = await this.prisma.technician.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Technician not found');
    await this.prisma.technician.update({ where: { id }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
    if (existing.userId) {
      await this.prisma.user.update({ where: { id: existing.userId }, data: { status: 'DISABLED' } });
      await this.tokens.revokeAllForUser(existing.userId);
    }
    await this.audit.log({ actorId, action: 'technician.deleted', entity: 'technicians', entityId: id, meta });
  }

  /** Creates a restricted STAFF login for the technician, or resets its password. */
  async setLogin(id: string, password: string, actorId: string, meta: RequestMeta): Promise<TechnicianSummary> {
    const tech = await this.prisma.technician.findFirst({ where: { id, deletedAt: null } });
    if (!tech) throw new NotFoundException('Technician not found');
    if (!tech.email) throw new BadRequestException('Add an email address to the technician before creating a login');
    const passwordHash = await this.passwords.hash(password);

    if (tech.userId) {
      await this.prisma.user.update({ where: { id: tech.userId }, data: { passwordHash, status: 'ACTIVE' } });
      await this.tokens.revokeAllForUser(tech.userId);
      await this.audit.log({ actorId, action: 'technician.login_reset', entity: 'technicians', entityId: id, meta });
      return toTechnicianSummary(tech);
    }

    const emailOwner = await this.prisma.user.findUnique({ where: { email: tech.email } });
    if (emailOwner) throw new ConflictException('A user with this email already exists');
    const [first, ...rest] = tech.name.split(' ');
    const staffRole = await this.prisma.role.findUniqueOrThrow({ where: { name: 'STAFF' } });
    const user = await this.prisma.user.create({
      data: {
        email: tech.email,
        passwordHash,
        firstName: first ?? tech.name,
        lastName: rest.join(' '),
        phone: tech.phone,
        whatsapp: tech.whatsapp,
        emailVerifiedAt: new Date(),
        roles: { create: { roleId: staffRole.id } },
      },
    });
    const updated = await this.prisma.technician.update({ where: { id }, data: { userId: user.id } });
    await this.audit.log({ actorId, action: 'technician.login_created', entity: 'technicians', entityId: id, meta, metadata: { userId: user.id } });
    return toTechnicianSummary(updated);
  }
}
