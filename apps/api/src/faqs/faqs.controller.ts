import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Faq, Paginated } from '@hikeup/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ReqMeta, type RequestMeta } from '../common/decorators/request-meta.decorator';
import { ManagerOnly } from '../common/decorators/roles.decorator';
import type { RequestUser } from '../common/types/request-user';
import { CreateFaqDto, FaqQueryDto, UpdateFaqDto } from './faq.dto';
import { FaqsService } from './faqs.service';

@ApiTags('FAQs')
@Controller('faqs')
export class PublicFaqsController {
  constructor(private readonly faqs: FaqsService) {}

  @Public()
  @ApiQuery({ name: 'category', required: false })
  @Get()
  list(@Query('category') category?: string): Promise<Faq[]> {
    return this.faqs.listPublished(category?.slice(0, 80));
  }
}

@ApiTags('Admin · FAQs')
@ApiBearerAuth()
@ApiCookieAuth()
@ManagerOnly()
@Controller('admin/faqs')
export class AdminFaqsController {
  constructor(private readonly faqs: FaqsService) {}

  @Get()
  list(@Query() query: FaqQueryDto): Promise<Paginated<Faq>> {
    return this.faqs.adminList(query);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<Faq> {
    return this.faqs.adminGet(id);
  }

  @Post()
  create(@Body() dto: CreateFaqDto, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<Faq> {
    return this.faqs.create(dto, user.id, meta);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFaqDto,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
  ): Promise<Faq> {
    return this.faqs.update(id, dto, user.id, meta);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<void> {
    return this.faqs.remove(id, user.id, meta);
  }
}
