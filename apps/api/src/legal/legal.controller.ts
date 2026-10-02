import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { LegalPage } from '@hikeup/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ReqMeta, type RequestMeta } from '../common/decorators/request-meta.decorator';
import { ManagerOnly } from '../common/decorators/roles.decorator';
import type { RequestUser } from '../common/types/request-user';
import { UpdateLegalPageDto } from './legal.dto';
import { LegalService } from './legal.service';

@ApiTags('Legal')
@Controller('legal')
export class PublicLegalController {
  constructor(private readonly legal: LegalService) {}

  /** privacy-policy | terms-and-conditions | cancellation-refund-policy */
  @Public()
  @Get(':slug')
  get(@Param('slug') slug: string): Promise<LegalPage> {
    return this.legal.getPublished(slug);
  }
}

@ApiTags('Admin · Legal Pages')
@ApiBearerAuth()
@ApiCookieAuth()
@ManagerOnly()
@Controller('admin/legal')
export class AdminLegalController {
  constructor(private readonly legal: LegalService) {}

  @Get()
  list(): Promise<LegalPage[]> {
    return this.legal.list();
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLegalPageDto,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
  ): Promise<LegalPage> {
    return this.legal.update(id, dto, user.id, meta);
  }
}
