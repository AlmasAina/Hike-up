import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, type QuoteStatus } from '@prisma/client';
import {
  CONTACT_METHOD_LABELS,
  MAX_QUOTE_IMAGES,
  PROPERTY_TYPE_LABELS,
  QUOTE_STATUS_LABELS,
  type AdminQuoteRequest,
  type CustomerDashboardStats,
  type CustomerQuoteRequest,
  type Paginated,
  type RequestMessage,
} from '@hikeup/types';
import { AuditService } from '../audit/audit.service';
import type { RequestMeta } from '../common/decorators/request-meta.decorator';
import type { RequestUser } from '../common/types/request-user';
import { paginate, skipTake } from '../common/utils/pagination';
import { sanitizePlainText } from '../common/utils/sanitize';
import { AppConfig } from '../config/app-config';
import { button, detailsTable, emailLayout, paragraph } from '../mail/mail-templates';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import type { UploadedImageFile } from '../storage/image-validation';
import { StorageService } from '../storage/storage.service';
import type {
  AdminRequestQueryDto,
  CreateQuoteRequestDto,
  CustomerRequestQueryDto,
  UpdateQuoteStatusDto,
} from './quote-request.dto';
import { adminInclude, customerInclude, toAdminRequest, toCustomerRequest, toMessage } from './quote-request.mapper';

const MAX_IMAGES_PER_REQUEST = 20;

const isManager = (user: RequestUser) => user.roles.includes('SUPER_ADMIN') || user.roles.includes('ADMIN');
const isBackOffice = (user: RequestUser) => isManager(user) || user.roles.includes('STAFF');

@Injectable()
export class QuoteRequestsService {
  private readonly logger = new Logger(QuoteRequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly mail: MailService,
    private readonly notifications: NotificationsService,
    private readonly settings: SettingsService,
    private readonly audit: AuditService,
    private readonly config: AppConfig,
  ) {}

  // ─────────────────────────────────────────────── submission ──

  async create(
    dto: CreateQuoteRequestDto,
    files: UploadedImageFile[] = [],
    user: RequestUser | undefined,
    meta: RequestMeta,
  ): Promise<{ id: string; reference: string; status: QuoteStatus }> {
    if (dto.website) throw new BadRequestException('Submission rejected');
    if (files.length > MAX_QUOTE_IMAGES) throw new BadRequestException(`You can attach up to ${MAX_QUOTE_IMAGES} images`);

    let service: { id: string; title: string } | null = null;
    if (dto.serviceId) {
      service = await this.prisma.service.findFirst({
        where: { id: dto.serviceId, deletedAt: null, status: 'PUBLISHED' },
        select: { id: true, title: true },
      });
      if (!service) throw new BadRequestException('Selected service is not available');
    }

    // Customer linkage: signed-in customer, otherwise none (linked later on registration by email).
    const customerId = user && !isBackOffice(user) ? user.id : null;

    const uploaded: { key: string; mimeType: string; size: number; originalName: string }[] = [];
    try {
      for (const file of files) {
        const stored = await this.storage.uploadImage(file, 'quote-requests', 'private');
        uploaded.push({
          key: stored.key,
          mimeType: stored.mimeType,
          size: stored.size,
          originalName: sanitizePlainText(file.originalname).slice(0, 255),
        });
      }

      const request = await this.prisma.quoteRequest.create({
        data: {
          type: dto.type ?? 'QUOTE',
          customerId,
          serviceId: service?.id ?? null,
          firstName: sanitizePlainText(dto.firstName),
          lastName: sanitizePlainText(dto.lastName),
          email: dto.email,
          phone: dto.phone,
          whatsapp: dto.whatsapp ?? null,
          location: sanitizePlainText(dto.location),
          propertyType: dto.propertyType,
          preferredContact: dto.preferredContact,
          description: sanitizePlainText(dto.description),
          additionalNotes: dto.additionalNotes ? sanitizePlainText(dto.additionalNotes) : null,
          ip: meta.ip,
          userAgent: meta.userAgent,
          images: { create: uploaded.map((u) => ({ ...u, uploadedById: customerId })) },
          statusHistory: { create: { toStatus: 'NEW', changedById: customerId } },
        },
      });

      await this.audit.log({
        actorId: customerId,
        action: 'quote_request.created',
        entity: 'quote_requests',
        entityId: request.id,
        meta,
        metadata: { reference: request.reference, images: uploaded.length },
      });
      void this.notifyNewRequest(request.id);
      return { id: request.id, reference: request.reference, status: request.status };
    } catch (error) {
      await Promise.all(uploaded.map((u) => this.storage.delete(u.key)));
      throw error;
    }
  }

  private async notifyNewRequest(requestId: string): Promise<void> {
    try {
      const request = await this.prisma.quoteRequest.findUniqueOrThrow({
        where: { id: requestId },
        include: { service: { select: { title: true } }, images: { select: { id: true } } },
      });
      const settings = await this.settings.getAll();
      const name = `${request.firstName} ${request.lastName}`;
      const adminLink = `${this.config.env.WEB_URL}/admin/quote-requests/${request.id}`;

      await this.notifications.notifyRoles({
        type: 'QUOTE_REQUEST_CREATED',
        title: `New ${request.type.toLowerCase()} request ${request.reference}`,
        body: `${name} — ${request.service?.title ?? 'General enquiry'} — ${request.location}`,
        link: `/admin/quote-requests/${request.id}`,
      });

      const details = detailsTable([
        ['Reference', request.reference],
        ['Name', name],
        ['Email', request.email],
        ['Phone', request.phone],
        ['WhatsApp', request.whatsapp],
        ['Service', request.service?.title ?? 'General enquiry'],
        ['Location', request.location],
        ['Property type', PROPERTY_TYPE_LABELS[request.propertyType]],
        ['Preferred contact', CONTACT_METHOD_LABELS[request.preferredContact]],
        ['Photos', String(request.images.length)],
      ]);

      const notifyTo = settings.notificationEmail || this.config.env.MAIL_TO || settings.email;
      await this.mail.send({
        to: notifyTo,
        replyTo: request.email,
        subject: `New quote request ${request.reference} — ${request.service?.title ?? 'General enquiry'}`,
        html: emailLayout(
          settings.companyName,
          'New quote request received',
          details + paragraph(request.description) + button(adminLink, 'Open in admin dashboard'),
        ),
        text: `New request ${request.reference} from ${name} (${request.phone}, ${request.email}).\n\n${request.description}\n\n${adminLink}`,
      });

      await this.mail.send({
        to: request.email,
        subject: `We received your request ${request.reference}`,
        html: emailLayout(
          settings.companyName,
          'Thank you — we received your request',
          paragraph(`Hello ${request.firstName}, thank you for contacting ${settings.companyName}.`) +
            paragraph(`Your reference is ${request.reference}. Our team will review the details and contact you by your preferred method.`) +
            paragraph('Please note: this is a request only — it is not a confirmed booking.') +
            (request.customerId ? button(`${this.config.env.WEB_URL}/customer/requests/${request.id}`, 'Track your request') : ''),
        ),
        text: `Hello ${request.firstName},\n\nThank you for contacting ${settings.companyName}. Your reference is ${request.reference}. Our team will contact you shortly.\n\nThis is a request only — not a confirmed booking.`,
      });
    } catch (error) {
      this.logger.error(`Failed to send notifications for request ${requestId}: ${(error as Error).message}`);
    }
  }

  // ───────────────────────────────────────────────── customer ──

  async customerDashboard(userId: string): Promise<CustomerDashboardStats> {
    const [stats] = await this.prisma.$queryRaw<{ total: bigint; pending: bigint; in_progress: bigint; completed: bigint }[]>`
      SELECT * FROM customer_request_stats(${userId}::uuid)`;
    const [recent, unreadMessages] = await Promise.all([
      this.prisma.quoteRequest.findMany({
        where: { customerId: userId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: customerInclude,
      }),
      this.prisma.requestMessage.count({
        where: { fromStaff: true, readAt: null, request: { customerId: userId, deletedAt: null } },
      }),
    ]);
    return {
      total: Number(stats?.total ?? 0),
      pending: Number(stats?.pending ?? 0),
      inProgress: Number(stats?.in_progress ?? 0),
      completed: Number(stats?.completed ?? 0),
      unreadMessages,
      recent: recent.map(toCustomerRequest),
    };
  }

  async customerList(userId: string, query: CustomerRequestQueryDto): Promise<Paginated<CustomerQuoteRequest>> {
    const where: Prisma.QuoteRequestWhereInput = {
      customerId: userId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { OR: [{ reference: { contains: query.search, mode: 'insensitive' } }, { description: { contains: query.search, mode: 'insensitive' } }] } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.quoteRequest.findMany({ where, orderBy: { createdAt: query.order }, include: customerInclude, ...skipTake(query.page, query.pageSize) }),
      this.prisma.quoteRequest.count({ where }),
    ]);
    return paginate(rows.map(toCustomerRequest), total, query.page, query.pageSize);
  }

  private async getOwned(userId: string, id: string) {
    const request = await this.prisma.quoteRequest.findFirst({ where: { id, customerId: userId, deletedAt: null }, include: customerInclude });
    if (!request) throw new NotFoundException('Request not found');
    return request;
  }

  async customerGet(userId: string, id: string): Promise<CustomerQuoteRequest> {
    return toCustomerRequest(await this.getOwned(userId, id));
  }

  async customerAddImages(user: RequestUser, id: string, files: UploadedImageFile[], meta: RequestMeta): Promise<CustomerQuoteRequest> {
    const request = await this.getOwned(user.id, id);
    if (!files.length) throw new BadRequestException('Please choose at least one image');
    if (request.images.length + files.length > MAX_IMAGES_PER_REQUEST) {
      throw new BadRequestException(`A request can have at most ${MAX_IMAGES_PER_REQUEST} images`);
    }
    const uploaded: string[] = [];
    try {
      const rows = [];
      for (const file of files) {
        const stored = await this.storage.uploadImage(file, 'quote-requests', 'private');
        uploaded.push(stored.key);
        rows.push({
          requestId: id,
          key: stored.key,
          mimeType: stored.mimeType,
          size: stored.size,
          originalName: sanitizePlainText(file.originalname).slice(0, 255),
          uploadedById: user.id,
        });
      }
      await this.prisma.quoteRequestImage.createMany({ data: rows });
    } catch (error) {
      await Promise.all(uploaded.map((k) => this.storage.delete(k)));
      throw error;
    }
    await this.audit.log({ actorId: user.id, action: 'quote_request.images_added', entity: 'quote_requests', entityId: id, meta, metadata: { count: files.length } });
    await this.notifications.notifyRoles({
      type: 'REQUEST_MESSAGE',
      title: `New photos on ${request.reference}`,
      body: `${user.firstName} added ${files.length} image(s).`,
      link: `/admin/quote-requests/${id}`,
    });
    return this.customerGet(user.id, id);
  }

  async customerMessages(userId: string, id: string): Promise<RequestMessage[]> {
    await this.getOwned(userId, id);
    const { companyName } = await this.settings.getAll();
    await this.prisma.requestMessage.updateMany({ where: { requestId: id, fromStaff: true, readAt: null }, data: { readAt: new Date() } });
    const messages = await this.prisma.requestMessage.findMany({
      where: { requestId: id },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { firstName: true, lastName: true } } },
    });
    return messages.map((m) => toMessage(m, companyName));
  }

  async customerThreads(userId: string) {
    const requests = await this.prisma.quoteRequest.findMany({
      where: { customerId: userId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        reference: true,
        status: true,
        service: { select: { title: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { body: true, createdAt: true, fromStaff: true } },
        _count: { select: { messages: { where: { fromStaff: true, readAt: null } } } },
      },
    });
    return requests.map((r) => ({
      requestId: r.id,
      reference: r.reference,
      status: r.status,
      service: r.service?.title ?? 'General enquiry',
      lastMessage: r.messages[0]
        ? { body: r.messages[0].body.slice(0, 160), createdAt: r.messages[0].createdAt.toISOString(), fromStaff: r.messages[0].fromStaff }
        : null,
      unread: r._count.messages,
    }));
  }

  async customerSendMessage(user: RequestUser, id: string, body: string, meta: RequestMeta): Promise<RequestMessage> {
    const request = await this.getOwned(user.id, id);
    const message = await this.prisma.requestMessage.create({
      data: { requestId: id, senderId: user.id, fromStaff: false, body: sanitizePlainText(body) },
      include: { sender: { select: { firstName: true, lastName: true } } },
    });
    await this.prisma.quoteRequest.update({ where: { id }, data: { updatedAt: new Date() } });
    const assigned = await this.assignedStaffUserIds(id);
    await this.notifications.notifyRoles({
      type: 'REQUEST_MESSAGE',
      title: `New message on ${request.reference}`,
      body: message.body.slice(0, 200),
      link: `/admin/quote-requests/${id}`,
    });
    await this.notifications.notifyUsers(assigned, {
      type: 'REQUEST_MESSAGE',
      title: `New message on ${request.reference}`,
      body: message.body.slice(0, 200),
      link: `/admin/quote-requests/${id}`,
    });
    await this.audit.log({ actorId: user.id, action: 'quote_request.message_sent', entity: 'quote_requests', entityId: id, meta });
    const { companyName } = await this.settings.getAll();
    return toMessage(message, companyName);
  }

  // ─────────────────────────────────────────────── back office ──

  private async technicianIdFor(user: RequestUser): Promise<string | null> {
    const tech = await this.prisma.technician.findUnique({ where: { userId: user.id }, select: { id: true } });
    return tech?.id ?? null;
  }

  private async assignedStaffUserIds(requestId: string): Promise<string[]> {
    const rows = await this.prisma.requestAssignment.findMany({
      where: { requestId },
      select: { technician: { select: { userId: true } } },
    });
    return rows.map((r) => r.technician.userId).filter((v): v is string => Boolean(v));
  }

  /** STAFF may only access requests assigned to them. */
  private async assertBackOfficeAccess(user: RequestUser, requestId: string): Promise<void> {
    if (isManager(user)) return;
    const techId = await this.technicianIdFor(user);
    if (!techId) throw new ForbiddenException('No technician profile is linked to your account');
    const assignment = await this.prisma.requestAssignment.findUnique({
      where: { requestId_technicianId: { requestId, technicianId: techId } },
    });
    if (!assignment) throw new ForbiddenException('This request is not assigned to you');
  }

  async adminList(user: RequestUser, query: AdminRequestQueryDto) {
    const where: Prisma.QuoteRequestWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.serviceId ? { serviceId: query.serviceId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(new Date(query.to).getTime() + 86_399_999) } : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { reference: { contains: query.search, mode: 'insensitive' } },
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search } },
              { location: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    if (!isManager(user) || query.assignedToMe) {
      const techId = await this.technicianIdFor(user);
      where.assignments = { some: { technicianId: techId ?? '00000000-0000-0000-0000-000000000000' } };
    }
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.quoteRequest.findMany({
        where,
        orderBy: { createdAt: query.order },
        ...skipTake(query.page, query.pageSize),
        include: {
          service: { select: { id: true, title: true, slug: true } },
          assignments: { include: { technician: { select: { id: true, name: true } } } },
          _count: { select: { images: true, messages: { where: { fromStaff: false, readAt: null } } } },
        },
      }),
      this.prisma.quoteRequest.count({ where }),
    ]);
    return paginate(
      rows.map((r) => ({
        id: r.id,
        reference: r.reference,
        type: r.type,
        status: r.status,
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        phone: r.phone,
        whatsapp: r.whatsapp,
        location: r.location,
        propertyType: r.propertyType,
        preferredContact: r.preferredContact,
        service: r.service,
        technicians: r.assignments.map((a) => a.technician),
        imageCount: r._count.images,
        unreadMessages: r._count.messages,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      query.page,
      query.pageSize,
    );
  }

  async adminGet(user: RequestUser, id: string): Promise<AdminQuoteRequest> {
    await this.assertBackOfficeAccess(user, id);
    const request = await this.prisma.quoteRequest.findFirst({ where: { id, deletedAt: null }, include: adminInclude });
    if (!request) throw new NotFoundException('Request not found');
    await this.prisma.requestMessage.updateMany({ where: { requestId: id, fromStaff: false, readAt: null }, data: { readAt: new Date() } });
    const { companyName } = await this.settings.getAll();
    return toAdminRequest(request, companyName);
  }

  async updateStatus(user: RequestUser, id: string, dto: UpdateQuoteStatusDto, meta: RequestMeta): Promise<AdminQuoteRequest> {
    await this.assertBackOfficeAccess(user, id);
    const existing = await this.prisma.quoteRequest.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Request not found');
    if (existing.status !== dto.status) {
      await this.prisma.$transaction([
        this.prisma.quoteRequest.update({ where: { id }, data: { status: dto.status } }),
        this.prisma.quoteStatusHistory.create({
          data: { requestId: id, fromStatus: existing.status, toStatus: dto.status, note: dto.note ? sanitizePlainText(dto.note) : null, changedById: user.id },
        }),
      ]);
      await this.audit.log({
        actorId: user.id,
        action: 'quote_request.status_changed',
        entity: 'quote_requests',
        entityId: id,
        meta,
        metadata: { from: existing.status, to: dto.status, reference: existing.reference },
      });
      void this.notifyStatusChange(existing.id, dto.status, dto.note ?? null);
    }
    return this.adminGet(user, id);
  }

  private async notifyStatusChange(id: string, status: QuoteStatus, note: string | null): Promise<void> {
    try {
      const request = await this.prisma.quoteRequest.findUniqueOrThrow({ where: { id } });
      const label = QUOTE_STATUS_LABELS[status];
      if (request.customerId) {
        await this.notifications.notifyUser(request.customerId, {
          type: 'QUOTE_STATUS_CHANGED',
          title: `Request ${request.reference} is now ${label}`,
          body: note ?? undefined,
          link: `/customer/requests/${id}`,
        });
      }
      const { companyName } = await this.settings.getAll();
      await this.mail.send({
        to: request.email,
        subject: `Update on your request ${request.reference}: ${label}`,
        html: emailLayout(
          companyName,
          `Your request is now ${label}`,
          paragraph(`Hello ${request.firstName}, the status of your request ${request.reference} has been updated to "${label}".`) +
            (note ? paragraph(note) : '') +
            (request.customerId ? button(`${this.config.env.WEB_URL}/customer/requests/${id}`, 'View request') : ''),
        ),
        text: `Hello ${request.firstName},\n\nYour request ${request.reference} is now "${label}".${note ? `\n\n${note}` : ''}`,
      });
    } catch (error) {
      this.logger.error(`Status notification failed for ${id}: ${(error as Error).message}`);
    }
  }

  async addNote(user: RequestUser, id: string, body: string, meta: RequestMeta): Promise<AdminQuoteRequest> {
    await this.assertBackOfficeAccess(user, id);
    await this.prisma.requestNote.create({ data: { requestId: id, authorId: user.id, body: sanitizePlainText(body) } });
    await this.audit.log({ actorId: user.id, action: 'quote_request.note_added', entity: 'quote_requests', entityId: id, meta });
    return this.adminGet(user, id);
  }

  async staffSendMessage(user: RequestUser, id: string, body: string, meta: RequestMeta): Promise<AdminQuoteRequest> {
    await this.assertBackOfficeAccess(user, id);
    const request = await this.prisma.quoteRequest.findFirst({ where: { id, deletedAt: null } });
    if (!request) throw new NotFoundException('Request not found');
    if (!request.customerId) {
      throw new BadRequestException('This request was submitted without an account. Contact the customer by phone, WhatsApp or email.');
    }
    await this.prisma.requestMessage.create({ data: { requestId: id, senderId: user.id, fromStaff: true, body: sanitizePlainText(body) } });
    await this.notifications.notifyUser(request.customerId, {
      type: 'REQUEST_MESSAGE',
      title: `New message about ${request.reference}`,
      body: body.slice(0, 200),
      link: `/customer/messages?request=${id}`,
    });
    const { companyName } = await this.settings.getAll();
    void this.mail.send({
      to: request.email,
      subject: `New message about your request ${request.reference}`,
      html: emailLayout(
        companyName,
        'You have a new message',
        paragraph(body) + button(`${this.config.env.WEB_URL}/customer/messages?request=${id}`, 'Reply in your dashboard'),
      ),
      text: `${body}\n\nReply: ${this.config.env.WEB_URL}/customer/messages?request=${id}`,
    });
    await this.audit.log({ actorId: user.id, action: 'quote_request.reply_sent', entity: 'quote_requests', entityId: id, meta });
    return this.adminGet(user, id);
  }

  async assign(user: RequestUser, id: string, technicianId: string, meta: RequestMeta): Promise<AdminQuoteRequest> {
    const request = await this.prisma.quoteRequest.findFirst({ where: { id, deletedAt: null } });
    if (!request) throw new NotFoundException('Request not found');
    const technician = await this.prisma.technician.findFirst({ where: { id: technicianId, deletedAt: null, status: 'ACTIVE' } });
    if (!technician) throw new BadRequestException('Technician not found or inactive');
    await this.prisma.requestAssignment.upsert({
      where: { requestId_technicianId: { requestId: id, technicianId } },
      update: {},
      create: { requestId: id, technicianId, assignedById: user.id },
    });
    if (technician.userId) {
      await this.notifications.notifyUser(technician.userId, {
        type: 'REQUEST_ASSIGNED',
        title: `You were assigned to ${request.reference}`,
        body: `${request.location}`,
        link: `/admin/quote-requests/${id}`,
      });
    }
    await this.audit.log({
      actorId: user.id,
      action: 'quote_request.assigned',
      entity: 'quote_requests',
      entityId: id,
      meta,
      metadata: { technicianId, technician: technician.name },
    });
    return this.adminGet(user, id);
  }

  async unassign(user: RequestUser, id: string, technicianId: string, meta: RequestMeta): Promise<AdminQuoteRequest> {
    await this.prisma.requestAssignment.deleteMany({ where: { requestId: id, technicianId } });
    await this.audit.log({ actorId: user.id, action: 'quote_request.unassigned', entity: 'quote_requests', entityId: id, meta, metadata: { technicianId } });
    return this.adminGet(user, id);
  }

  async remove(user: RequestUser, id: string, meta: RequestMeta): Promise<void> {
    const request = await this.prisma.quoteRequest.findFirst({ where: { id, deletedAt: null } });
    if (!request) throw new NotFoundException('Request not found');
    await this.prisma.quoteRequest.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit.log({ actorId: user.id, action: 'quote_request.deleted', entity: 'quote_requests', entityId: id, meta, metadata: { reference: request.reference } });
  }

  // ───────────────────────────────────────────────────── files ──

  /** Authorises access to a private request image. Returns the storage key and MIME type. */
  async authoriseImage(user: RequestUser, imageId: string): Promise<{ key: string; mimeType: string }> {
    const image = await this.prisma.quoteRequestImage.findUnique({
      where: { id: imageId },
      include: { request: { select: { id: true, customerId: true, deletedAt: true } } },
    });
    if (!image || image.request.deletedAt) throw new NotFoundException('File not found');
    if (isBackOffice(user)) {
      await this.assertBackOfficeAccess(user, image.request.id);
    } else if (image.request.customerId !== user.id) {
      throw new NotFoundException('File not found');
    }
    return { key: image.key, mimeType: image.mimeType };
  }
}
