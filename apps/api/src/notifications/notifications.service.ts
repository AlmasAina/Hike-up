import { Injectable, Logger } from '@nestjs/common';
import type { NotificationType, RoleName } from '@prisma/client';
import type { Notification } from '@hikeup/types';
import { PrismaService } from '../prisma/prisma.service';

interface NotificationInput {
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}

/** In-app (dashboard) notifications. Email is sent separately by the feature services. */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async notifyUser(userId: string, input: NotificationInput): Promise<void> {
    await this.notifyUsers([userId], input);
  }

  async notifyUsers(userIds: string[], input: NotificationInput): Promise<void> {
    const unique = Array.from(new Set(userIds));
    if (unique.length === 0) return;
    try {
      await this.prisma.notification.createMany({
        data: unique.map((userId) => ({
          userId,
          type: input.type,
          title: input.title.slice(0, 200),
          body: input.body?.slice(0, 1000) ?? null,
          link: input.link ?? null,
        })),
      });
    } catch (error) {
      this.logger.error(`Failed to create notifications: ${(error as Error).message}`);
    }
  }

  /** Notifies every active user holding one of the given roles (default: admins). */
  async notifyRoles(input: NotificationInput, roles: RoleName[] = ['SUPER_ADMIN', 'ADMIN']): Promise<void> {
    const users = await this.prisma.user.findMany({
      where: { status: 'ACTIVE', roles: { some: { role: { name: { in: roles } } } } },
      select: { id: true },
    });
    await this.notifyUsers(users.map((u) => u.id), input);
  }

  async list(userId: string, limit = 30): Promise<{ items: Notification[]; unread: number }> {
    const [rows, unread] = await this.prisma.$transaction([
      this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return {
      unread,
      items: rows.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        readAt: n.readAt?.toISOString() ?? null,
        createdAt: n.createdAt.toISOString(),
      })),
    };
  }

  async markRead(userId: string, id: string): Promise<void> {
    await this.prisma.notification.updateMany({ where: { id, userId, readAt: null }, data: { readAt: new Date() } });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
  }
}
