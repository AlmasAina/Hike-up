import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { RequestMeta } from '../common/decorators/request-meta.decorator';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditEntry {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: RequestMeta;
  metadata?: Record<string, unknown>;
}

/** Writes to audit_logs. Never throws — auditing must not break the audited operation. */
@Injectable()
export class AuditService {
  private readonly logger = new Logger('Audit');

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: entry.actorId ?? null,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId ?? null,
          ip: entry.meta?.ip ?? null,
          userAgent: entry.meta?.userAgent ?? null,
          metadata: (entry.metadata as Prisma.InputJsonValue | undefined) ?? Prisma.JsonNull,
        },
      });
      this.logger.log(`${entry.action} ${entry.entity}${entry.entityId ? `#${entry.entityId}` : ''} by ${entry.actorId ?? 'system'}`);
    } catch (error) {
      this.logger.error(`Failed to write audit log ${entry.action}: ${(error as Error).message}`);
    }
  }
}
