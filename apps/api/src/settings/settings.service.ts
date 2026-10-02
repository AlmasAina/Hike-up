import { Injectable } from '@nestjs/common';
import type { AdminSettings, PublicSettings } from '@hikeup/types';
import type { RequestMeta } from '../common/decorators/request-meta.decorator';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { SETTING_DEFINITIONS, SETTING_KEYS } from './settings.definitions';
import type { UpdateSettingsDto } from './dto/update-settings.dto';

const CACHE_TTL_MS = 30_000;

/**
 * Centralised site settings (contact details, social links, SEO…).
 * Every tel:/wa.me link, footer and CTA on the website reads from here.
 */
@Injectable()
export class SettingsService {
  private cache?: { value: AdminSettings; expiresAt: number };

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getAll(): Promise<AdminSettings> {
    if (this.cache && this.cache.expiresAt > Date.now()) return this.cache.value;
    const rows = await this.prisma.siteSetting.findMany();
    const map = new Map(rows.map((r) => [r.key, r.value]));
    const result = {} as Record<string, string | boolean>;
    for (const key of SETTING_KEYS) {
      const def = SETTING_DEFINITIONS[key];
      const raw = map.get(key) ?? def.fallback;
      result[key] = def.kind === 'boolean' ? raw === 'true' : raw;
    }
    const value = result as unknown as AdminSettings;
    this.cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
    return value;
  }

  async getPublic(): Promise<PublicSettings> {
    const all = await this.getAll();
    const result: Record<string, unknown> = {};
    for (const key of SETTING_KEYS) {
      if (SETTING_DEFINITIONS[key].isPublic) result[key] = all[key];
    }
    if (!all.showLicenceNumber) result.licenceNumber = '';
    return result as unknown as PublicSettings;
  }

  async update(dto: UpdateSettingsDto, actorId: string, meta: RequestMeta): Promise<AdminSettings> {
    const entries = Object.entries(dto).filter(
      ([key, value]) => value !== undefined && key in SETTING_DEFINITIONS,
    ) as [keyof AdminSettings, string | boolean][];

    await this.prisma.$transaction(
      entries.map(([key, value]) =>
        this.prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(value).trim(), updatedById: actorId },
          create: {
            key,
            value: String(value).trim(),
            isPublic: SETTING_DEFINITIONS[key].isPublic,
            updatedById: actorId,
          },
        }),
      ),
    );
    this.cache = undefined;
    await this.audit.log({
      actorId,
      action: 'settings.updated',
      entity: 'site_settings',
      meta,
      metadata: { keys: entries.map(([key]) => key) },
    });
    return this.getAll();
  }

  invalidate(): void {
    this.cache = undefined;
  }
}
