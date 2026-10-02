import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Paginated, TechnicianSummary } from '@hikeup/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReqMeta, type RequestMeta } from '../common/decorators/request-meta.decorator';
import { ManagerOnly } from '../common/decorators/roles.decorator';
import type { RequestUser } from '../common/types/request-user';
import { CreateTechnicianDto, TechnicianLoginDto, TechnicianQueryDto, UpdateTechnicianDto } from './technician.dto';
import { TechniciansService } from './technicians.service';

@ApiTags('Admin · Technicians')
@ApiBearerAuth()
@ApiCookieAuth()
@ManagerOnly()
@Controller('admin/technicians')
export class TechniciansController {
  constructor(private readonly technicians: TechniciansService) {}

  @Get()
  list(@Query() query: TechnicianQueryDto): Promise<Paginated<TechnicianSummary>> {
    return this.technicians.list(query);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<TechnicianSummary> {
    return this.technicians.get(id);
  }

  @Post()
  create(@Body() dto: CreateTechnicianDto, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<TechnicianSummary> {
    return this.technicians.create(dto, user.id, meta);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTechnicianDto,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
  ): Promise<TechnicianSummary> {
    return this.technicians.update(id, dto, user.id, meta);
  }

  /** Create or reset the technician's restricted STAFF login */
  @Put(':id/login')
  setLogin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TechnicianLoginDto,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
  ): Promise<TechnicianSummary> {
    return this.technicians.setLogin(id, dto.password, user.id, meta);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<void> {
    return this.technicians.remove(id, user.id, meta);
  }
}
