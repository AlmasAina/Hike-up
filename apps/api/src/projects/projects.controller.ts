import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Paginated, Project } from '@hikeup/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ReqMeta, type RequestMeta } from '../common/decorators/request-meta.decorator';
import { ManagerOnly } from '../common/decorators/roles.decorator';
import type { RequestUser } from '../common/types/request-user';
import { CreateProjectDto, ProjectQueryDto, UpdateProjectDto } from './project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@Controller('projects')
export class PublicProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  /** Published projects, optionally filtered by service slug */
  @Public()
  @Get()
  list(@Query() query: ProjectQueryDto): Promise<Paginated<Project>> {
    return this.projects.list(query, true);
  }

  @Public()
  @Get(':slug')
  get(@Param('slug') slug: string): Promise<Project> {
    return this.projects.getPublishedBySlug(slug);
  }
}

@ApiTags('Admin · Projects')
@ApiBearerAuth()
@ApiCookieAuth()
@ManagerOnly()
@Controller('admin/projects')
export class AdminProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(@Query() query: ProjectQueryDto): Promise<Paginated<Project>> {
    return this.projects.list(query, false);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<Project> {
    return this.projects.adminGet(id);
  }

  @Post()
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<Project> {
    return this.projects.create(dto, user.id, meta);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
  ): Promise<Project> {
    return this.projects.update(id, dto, user.id, meta);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<void> {
    return this.projects.remove(id, user.id, meta);
  }
}
