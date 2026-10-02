import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { MaintenancePackage, PackageComparisonRow, PackagesResponse } from '@hikeup/types';
import { AuditService } from '../audit/audit.service';
import type { RequestMeta } from '../common/decorators/request-meta.decorator';
import { archivedSlug, normalizeSlug } from '../common/utils/slug';
import { PrismaService } from '../prisma/prisma.service';
import type {
  ComparisonRowDto,
  CreatePackageDto,
  PackageFeatureDto,
  UpdateComparisonRowDto,
  UpdatePackageDto,
} from './dto/package.dto';
import { packageInclude, toComparisonRow, toPackage } from './package.mapper';

@Injectable()
export class PackagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listPublic(): Promise<PackagesResponse> {
    const [packages, rows] = await this.prisma.$transaction([
      this.prisma.package.findMany({
        where: { active: true, deletedAt: null },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: packageInclude,
      }),
      this.prisma.packageComparisonRow.findMany({ orderBy: { sortOrder: 'asc' } }),
    ]);
    return { packages: packages.map(toPackage), comparisonRows: rows.map(toComparisonRow) };
  }

  async adminList(): Promise<PackagesResponse> {
    const [packages, rows] = await this.prisma.$transaction([
      this.prisma.package.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: 'asc' }, include: packageInclude }),
      this.prisma.packageComparisonRow.findMany({ orderBy: { sortOrder: 'asc' } }),
    ]);
    return { packages: packages.map(toPackage), comparisonRows: rows.map(toComparisonRow) };
  }

  async adminGet(id: string): Promise<MaintenancePackage> {
    const pkg = await this.prisma.package.findFirst({ where: { id, deletedAt: null }, include: packageInclude });
    if (!pkg) throw new NotFoundException('Package not found');
    return toPackage(pkg);
  }

  private validateFeatures(features: PackageFeatureDto[] | undefined): void {
    if (!features) return;
    const seen = new Set<string>();
    for (const feature of features) {
      if (feature.availability === 'CUSTOM' && !feature.value) {
        throw new BadRequestException(`Feature "${feature.label}" needs a custom value`);
      }
      if (feature.comparisonRowId) {
        if (seen.has(feature.comparisonRowId)) throw new BadRequestException('Each comparison row may only be set once per package');
        seen.add(feature.comparisonRowId);
      }
    }
  }

  private featureCreates(features: PackageFeatureDto[]) {
    return features.map((f, i) => ({
      comparisonRowId: f.comparisonRowId ?? null,
      label: f.label,
      availability: f.availability,
      value: f.availability === 'CUSTOM' ? (f.value ?? null) : null,
      showOnCard: f.showOnCard ?? f.availability !== 'NOT_INCLUDED',
      sortOrder: i,
    }));
  }

  /** Only one package can be "featured" (highlighted) at a time. */
  private async clearOtherFeatured(exceptId?: string) {
    await this.prisma.package.updateMany({ where: { featured: true, ...(exceptId ? { id: { not: exceptId } } : {}) }, data: { featured: false } });
  }

  async create(dto: CreatePackageDto, actorId: string, meta: RequestMeta): Promise<MaintenancePackage> {
    this.validateFeatures(dto.features);
    if (dto.featured) await this.clearOtherFeatured();
    const { features, slug, ...rest } = dto;
    const pkg = await this.prisma.package.create({
      data: {
        ...rest,
        slug: normalizeSlug(slug, dto.name),
        sortOrder: dto.sortOrder ?? (await this.prisma.package.count({ where: { deletedAt: null } })),
        features: features ? { create: this.featureCreates(features) } : undefined,
      },
      include: packageInclude,
    });
    await this.audit.log({ actorId, action: 'package.created', entity: 'packages', entityId: pkg.id, meta, metadata: { name: pkg.name } });
    return toPackage(pkg);
  }

  async update(id: string, dto: UpdatePackageDto, actorId: string, meta: RequestMeta): Promise<MaintenancePackage> {
    const existing = await this.prisma.package.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Package not found');
    this.validateFeatures(dto.features);
    if (dto.featured) await this.clearOtherFeatured(id);
    const { features, slug, ...rest } = dto;
    const pkg = await this.prisma.$transaction(async (tx) => {
      if (features) await tx.packageFeature.deleteMany({ where: { packageId: id } });
      return tx.package.update({
        where: { id },
        data: {
          ...rest,
          slug: slug !== undefined ? normalizeSlug(slug, dto.name ?? existing.name) : undefined,
          features: features ? { create: this.featureCreates(features) } : undefined,
        },
        include: packageInclude,
      });
    });
    await this.audit.log({ actorId, action: 'package.updated', entity: 'packages', entityId: id, meta, metadata: { fields: Object.keys(dto) } });
    return toPackage(pkg);
  }

  async remove(id: string, actorId: string, meta: RequestMeta): Promise<void> {
    const existing = await this.prisma.package.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Package not found');
    await this.prisma.package.update({
      where: { id },
      data: { deletedAt: new Date(), active: false, featured: false, slug: archivedSlug(existing.slug) },
    });
    await this.audit.log({ actorId, action: 'package.deleted', entity: 'packages', entityId: id, meta, metadata: { name: existing.name } });
  }

  async reorder(ids: string[], actorId: string, meta: RequestMeta): Promise<void> {
    await this.prisma.$transaction(ids.map((id, i) => this.prisma.package.update({ where: { id }, data: { sortOrder: i } })));
    await this.audit.log({ actorId, action: 'package.reordered', entity: 'packages', meta });
  }

  // ───────────────────── comparison rows ──

  async createRow(dto: ComparisonRowDto, actorId: string, meta: RequestMeta): Promise<PackageComparisonRow> {
    const row = await this.prisma.packageComparisonRow.create({
      data: { ...dto, sortOrder: dto.sortOrder ?? (await this.prisma.packageComparisonRow.count()) },
    });
    await this.audit.log({ actorId, action: 'package_row.created', entity: 'package_comparison_rows', entityId: row.id, meta });
    return toComparisonRow(row);
  }

  async updateRow(id: string, dto: UpdateComparisonRowDto, actorId: string, meta: RequestMeta): Promise<PackageComparisonRow> {
    const row = await this.prisma.packageComparisonRow.update({ where: { id }, data: dto });
    if (dto.label) {
      await this.prisma.packageFeature.updateMany({ where: { comparisonRowId: id }, data: { label: dto.label } });
    }
    await this.audit.log({ actorId, action: 'package_row.updated', entity: 'package_comparison_rows', entityId: id, meta });
    return toComparisonRow(row);
  }

  async removeRow(id: string, actorId: string, meta: RequestMeta): Promise<void> {
    await this.prisma.packageComparisonRow.delete({ where: { id } });
    await this.audit.log({ actorId, action: 'package_row.deleted', entity: 'package_comparison_rows', entityId: id, meta });
  }

  async reorderRows(ids: string[], actorId: string, meta: RequestMeta): Promise<void> {
    await this.prisma.$transaction(ids.map((id, i) => this.prisma.packageComparisonRow.update({ where: { id }, data: { sortOrder: i } })));
    await this.audit.log({ actorId, action: 'package_row.reordered', entity: 'package_comparison_rows', meta });
  }
}
