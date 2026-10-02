import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import type { AuditLogEntry, Paginated } from '@hikeup/types';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { paginate, skipTake } from '../common/utils/pagination';
import { PrismaService } from '../prisma/prisma.service';

class AuditQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  entity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  action?: string;
}

@ApiTags('Admin · Audit Logs')
@ApiBearerAuth()
@ApiCookieAuth()
@Roles('SUPER_ADMIN')
@Controller('admin/audit-logs')
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query() query: AuditQueryDto): Promise<Paginated<AuditLogEntry>> {
    const where: Prisma.AuditLogWhereInput = {
      ...(query.entity ? { entity: query.entity } : {}),
      ...(query.action ? { action: { contains: query.action, mode: 'insensitive' } } : {}),
      ...(query.search
        ? {
            OR: [
              { action: { contains: query.search, mode: 'insensitive' } },
              { entity: { contains: query.search, mode: 'insensitive' } },
              { entityId: { contains: query.search } },
              { actor: { email: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: query.order },
        ...skipTake(query.page, query.pageSize),
        include: { actor: { select: { id: true, email: true, firstName: true, lastName: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return paginate(
      rows.map((row) => ({
        id: row.id,
        action: row.action,
        entity: row.entity,
        entityId: row.entityId,
        ip: row.ip,
        metadata: (row.metadata as Record<string, unknown> | null) ?? null,
        actor: row.actor
          ? { id: row.actor.id, email: row.actor.email, name: `${row.actor.firstName} ${row.actor.lastName}`.trim() }
          : null,
        createdAt: row.createdAt.toISOString(),
      })),
      total,
      query.page,
      query.pageSize,
    );
  }
}
