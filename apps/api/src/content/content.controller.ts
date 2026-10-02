import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { ContentSection } from '@hikeup/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ReqMeta, type RequestMeta } from '../common/decorators/request-meta.decorator';
import { ManagerOnly } from '../common/decorators/roles.decorator';
import type { RequestUser } from '../common/types/request-user';
import { UpdateContentSectionDto } from './content.dto';
import { ContentService } from './content.service';

@ApiTags('Content')
@Controller('content')
export class PublicContentController {
  constructor(private readonly content: ContentService) {}

  /** Page content blocks keyed by section key, e.g. ?prefix=about. */
  @Public()
  @ApiQuery({ name: 'prefix', required: false, example: 'about.' })
  @Get()
  get(@Query('prefix') prefix?: string): Promise<Record<string, ContentSection>> {
    return this.content.getMap(prefix?.slice(0, 40));
  }
}

@ApiTags('Admin · Page Content')
@ApiBearerAuth()
@ApiCookieAuth()
@ManagerOnly()
@Controller('admin/content')
export class AdminContentController {
  constructor(private readonly content: ContentService) {}

  @Get()
  list(): Promise<ContentSection[]> {
    return this.content.list();
  }

  @Patch(':key')
  update(
    @Param('key') key: string,
    @Body() dto: UpdateContentSectionDto,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
  ): Promise<ContentSection> {
    return this.content.update(key, dto, user.id, meta);
  }
}
