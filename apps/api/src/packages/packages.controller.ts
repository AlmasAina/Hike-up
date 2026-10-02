import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { MaintenancePackage, PackageComparisonRow, PackagesResponse } from '@hikeup/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ReqMeta, type RequestMeta } from '../common/decorators/request-meta.decorator';
import { ManagerOnly } from '../common/decorators/roles.decorator';
import { ReorderDto } from '../common/dto/reorder.dto';
import type { RequestUser } from '../common/types/request-user';
import { ComparisonRowDto, CreatePackageDto, UpdateComparisonRowDto, UpdatePackageDto } from './dto/package.dto';
import { PackagesService } from './packages.service';

@ApiTags('Packages')
@Controller('packages')
export class PublicPackagesController {
  constructor(private readonly packages: PackagesService) {}

  /** Active packages plus the comparison table rows */
  @Public()
  @Get()
  list(): Promise<PackagesResponse> {
    return this.packages.listPublic();
  }
}

@ApiTags('Admin · Packages')
@ApiBearerAuth()
@ApiCookieAuth()
@ManagerOnly()
@Controller('admin')
export class AdminPackagesController {
  constructor(private readonly packages: PackagesService) {}

  @Get('packages')
  list(): Promise<PackagesResponse> {
    return this.packages.adminList();
  }

  @Get('packages/:id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<MaintenancePackage> {
    return this.packages.adminGet(id);
  }

  @Post('packages')
  create(@Body() dto: CreatePackageDto, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<MaintenancePackage> {
    return this.packages.create(dto, user.id, meta);
  }

  @Put('packages/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorder(@Body() dto: ReorderDto, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<void> {
    return this.packages.reorder(dto.ids, user.id, meta);
  }

  @Patch('packages/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePackageDto,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
  ): Promise<MaintenancePackage> {
    return this.packages.update(id, dto, user.id, meta);
  }

  @Delete('packages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<void> {
    return this.packages.remove(id, user.id, meta);
  }

  @Post('package-comparison-rows')
  createRow(@Body() dto: ComparisonRowDto, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<PackageComparisonRow> {
    return this.packages.createRow(dto, user.id, meta);
  }

  @Put('package-comparison-rows/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorderRows(@Body() dto: ReorderDto, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<void> {
    return this.packages.reorderRows(dto.ids, user.id, meta);
  }

  @Patch('package-comparison-rows/:id')
  updateRow(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateComparisonRowDto,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
  ): Promise<PackageComparisonRow> {
    return this.packages.updateRow(id, dto, user.id, meta);
  }

  @Delete('package-comparison-rows/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeRow(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<void> {
    return this.packages.removeRow(id, user.id, meta);
  }
}
