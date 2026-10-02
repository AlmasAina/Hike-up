import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Notification } from '@hikeup/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@ApiCookieAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  /** Latest notifications for the signed-in user (customer or back-office). */
  @Get()
  list(@CurrentUser() user: RequestUser): Promise<{ items: Notification[]; unread: number }> {
    return this.notifications.list(user.id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':id/read')
  markRead(@CurrentUser() user: RequestUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.notifications.markRead(user.id, id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('read-all')
  markAllRead(@CurrentUser() user: RequestUser): Promise<void> {
    return this.notifications.markAllRead(user.id);
  }
}
