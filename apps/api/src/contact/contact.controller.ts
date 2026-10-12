import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { ContactMessage, Paginated } from '@hikeup/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ReqMeta, type RequestMeta } from '../common/decorators/request-meta.decorator';
import { ManagerOnly } from '../common/decorators/roles.decorator';
import type { RequestUser } from '../common/types/request-user';
import { ContactQueryDto, CreateContactMessageDto, ReplyContactMessageDto, UpdateContactMessageDto } from './contact.dto';
import { ContactService } from './contact.service';

@ApiTags('Contact')
@Controller('contact')
export class PublicContactController {
  constructor(private readonly contact: ContactService) {}

  /** Website contact form. Stores the message and notifies the team by email + dashboard. */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  create(@Body() dto: CreateContactMessageDto, @ReqMeta() meta: RequestMeta): Promise<{ id: string }> {
    return this.contact.create(dto, meta);
  }
}

@ApiTags('Admin · Contact Messages')
@ApiBearerAuth()
@ApiCookieAuth()
@ManagerOnly()
@Controller('admin/contact-messages')
export class AdminContactController {
  constructor(private readonly contact: ContactService) {}

  @Get()
  list(@Query() query: ContactQueryDto): Promise<Paginated<ContactMessage>> {
    return this.contact.list(query);
  }

  /** Opening a NEW message marks it as READ */
  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<ContactMessage> {
    return this.contact.get(id);
  }

  /** Mark READ / REPLIED / ARCHIVED */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactMessageDto,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
  ): Promise<ContactMessage> {
    return this.contact.updateStatus(id, dto.status, user.id, meta);
  }

  /** Emails a reply to the sender from the website's mail account and marks the message REPLIED. */
  @Post(':id/reply')
  reply(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplyContactMessageDto,
    @CurrentUser() user: RequestUser,
    @ReqMeta() meta: RequestMeta,
  ): Promise<ContactMessage> {
    return this.contact.reply(id, dto.message, user.id, meta);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser, @ReqMeta() meta: RequestMeta): Promise<void> {
    return this.contact.remove(id, user.id, meta);
  }
}
