import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Paginated, ServiceDetail, ServiceSummary } from '@hikeup/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ReqMeta, type RequestMeta } from '../common/decorators/request-meta.decorator';
import { ManagerOnly } from '../common/decorators/roles.decorator';
import { ReorderDto } from '../common/dto/reorder.dto';
import type { RequestUser } from '../common/types/request-user';
import { CreateServiceDto, ServiceQueryDto, UpdateServiceDto } from './dto/service.dto';
import { ServicesService } from './services.service';

@ApiTags('Services')
@Controller('services')
export class PublicServicesController {
  constructor(private readonly services: ServicesService) {}

  /** Published services in display order */
  @Public()
  @Get()
  list(): Promise<ServiceSummary[]> {
    return this.services.listPublished();
  }

  /** Published service detail with features, FAQs, gallery and related services */
  @Public()
  @Get(':slug')
  get(@Param('slug') slug: string): Promise<ServiceDetail> {
    return this.services.getPublishedBySlug(slug);
  }
}

@ApiTags('Admin · Services')
@ApiBearerAuth()
@ApiCookieAuth()
@ManagerOnly()
@Controller('admin/services')
export class AdminServicesController {
  constructor(private readonly services: ServicesService) {}

  @Get()
  list(@Query() query: ServiceQueryDto): Promise<Paginated<ServiceSummary & { updatedAt: string }>> {
    return this.services.adminList(query);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<ServiceDetail> {
    return this.services.adminGet(id);
  }

  @Post()
  create(@Body() dto: CreateServiceDto, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<ServiceDetail> {
    return this.services.create(dto, user.id, meta);
  }

  @Put('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorder(@Body() dto: ReorderDto, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<void> {
    return this.services.reorder(dto.ids, user.id, meta);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
  ): Promise<ServiceDetail> {
    return this.services.update(id, dto, user.id, meta);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<void> {
    return this.services.remove(id, user.id, meta);
  }
}
