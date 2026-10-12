import { BadRequestException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Prisma, type ContactMessage as ContactRow } from '@prisma/client';
import type { ContactMessage, Paginated } from '@hikeup/types';
import { AuditService } from '../audit/audit.service';
import type { RequestMeta } from '../common/decorators/request-meta.decorator';
import { paginate, skipTake } from '../common/utils/pagination';
import { escapeHtml, sanitizePlainText } from '../common/utils/sanitize';
import { AppConfig } from '../config/app-config';
import { button, detailsTable, emailLayout, paragraph } from '../mail/mail-templates';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import type { ContactQueryDto, CreateContactMessageDto } from './contact.dto';

const toMessage = (m: ContactRow): ContactMessage => ({
  id: m.id,
  name: m.name,
  email: m.email,
  phone: m.phone,
  subject: m.subject,
  message: m.message,
  status: m.status,
  createdAt: m.createdAt.toISOString(),
  updatedAt: m.updatedAt.toISOString(),
});

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly notifications: NotificationsService,
    private readonly settings: SettingsService,
    private readonly audit: AuditService,
    private readonly config: AppConfig,
  ) {}

  async create(dto: CreateContactMessageDto, meta: RequestMeta): Promise<{ id: string }> {
    if (dto.website) throw new BadRequestException('Submission rejected');
    const message = await this.prisma.contactMessage.create({
      data: {
        name: sanitizePlainText(dto.name),
        email: dto.email,
        phone: dto.phone ?? null,
        subject: sanitizePlainText(dto.subject),
        message: sanitizePlainText(dto.message),
        ip: meta.ip,
        userAgent: meta.userAgent,
      },
    });
    void this.notify(message);
    return { id: message.id };
  }

  private async notify(message: ContactRow): Promise<void> {
    try {
      await this.notifications.notifyRoles({
        type: 'CONTACT_MESSAGE',
        title: `New contact message: ${message.subject}`,
        body: `${message.name} <${message.email}>`,
        link: `/admin/messages?id=${message.id}`,
      });
      const settings = await this.settings.getAll();
      await this.mail.send({
        to: settings.notificationEmail || this.config.env.MAIL_TO || settings.email,
        replyTo: message.email,
        subject: `Website contact: ${message.subject}`,
        html: emailLayout(
          settings.companyName,
          'New contact form message',
          detailsTable([
            ['Name', message.name],
            ['Email', message.email],
            ['Phone', message.phone],
            ['Subject', message.subject],
          ]) +
            paragraph(message.message) +
            button(`${this.config.env.WEB_URL}/admin/messages?id=${message.id}`, 'Open in admin'),
        ),
        text: `From ${message.name} <${message.email}> ${message.phone ?? ''}\nSubject: ${message.subject}\n\n${message.message}`,
      });
    } catch (error) {
      this.logger.error(`Contact notification failed: ${(error as Error).message}`);
    }
  }

  async reply(id: string, text: string, actorId: string, meta: RequestMeta): Promise<ContactMessage> {
    const row = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Message not found');
    // Escaped by the email template, so the admin's text is sent as typed (line breaks kept).
    const body = text.trim();
    const settings = await this.settings.getAll();
    const sent = await this.mail.send({
      to: row.email,
      replyTo: settings.notificationEmail || this.config.env.MAIL_TO || settings.email || undefined,
      subject: `Re: ${row.subject}`,
      html: emailLayout(
        settings.companyName,
        `Re: ${row.subject}`,
        paragraph(`Dear ${row.name},`) +
          `<p style="font-size:15px;line-height:1.6;margin:0 0 12px;white-space:pre-line">${escapeHtml(body)}</p>` +
          `<hr style="border:none;border-top:1px solid #e3e8f0;margin:24px 0">` +
          `<p style="font-size:13px;color:#6b7890;margin:0 0 6px">Your message:</p>` +
          `<p style="font-size:13px;line-height:1.5;color:#6b7890;margin:0;white-space:pre-line">${escapeHtml(row.message)}</p>`,
      ),
      text: `Dear ${row.name},\n\n${body}\n\n---\nYour message:\n${row.message}`,
    });
    if (!sent) throw new ServiceUnavailableException('The reply could not be sent. Check the email settings and try again.');
    const updated = await this.prisma.contactMessage.update({ where: { id }, data: { status: 'REPLIED' } });
    await this.audit.log({ actorId, action: 'contact_message.replied', entity: 'contact_messages', entityId: id, meta });
    return toMessage(updated);
  }

  async list(query: ContactQueryDto): Promise<Paginated<ContactMessage>> {
    const where: Prisma.ContactMessageWhereInput = {
      ...(query.status ? { status: query.status } : { status: { not: 'ARCHIVED' } }),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { subject: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.contactMessage.findMany({ where, orderBy: { createdAt: query.order }, ...skipTake(query.page, query.pageSize) }),
      this.prisma.contactMessage.count({ where }),
    ]);
    return paginate(rows.map(toMessage), total, query.page, query.pageSize);
  }

  async get(id: string): Promise<ContactMessage> {
    const row = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Message not found');
    if (row.status === 'NEW') {
      return toMessage(await this.prisma.contactMessage.update({ where: { id }, data: { status: 'READ' } }));
    }
    return toMessage(row);
  }

  async updateStatus(id: string, status: ContactRow['status'], actorId: string, meta: RequestMeta): Promise<ContactMessage> {
    const row = await this.prisma.contactMessage.update({ where: { id }, data: { status } });
    await this.audit.log({ actorId, action: `contact_message.${status.toLowerCase()}`, entity: 'contact_messages', entityId: id, meta });
    return toMessage(row);
  }

  async remove(id: string, actorId: string, meta: RequestMeta): Promise<void> {
    await this.prisma.contactMessage.delete({ where: { id } });
    await this.audit.log({ actorId, action: 'contact_message.deleted', entity: 'contact_messages', entityId: id, meta });
  }
}
