import type { Prisma } from '@prisma/client';
import type { AdminQuoteRequest, CustomerQuoteRequest, RequestMessage, TechnicianSummary } from '@hikeup/types';

export const customerInclude = {
  service: { select: { id: true, title: true, slug: true } },
  images: { orderBy: { createdAt: 'asc' } },
  statusHistory: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.QuoteRequestInclude;

export const adminInclude = {
  ...customerInclude,
  notes: { orderBy: { createdAt: 'desc' }, include: { author: { select: { id: true, firstName: true, lastName: true } } } },
  assignments: { orderBy: { createdAt: 'asc' }, include: { technician: true } },
  messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { firstName: true, lastName: true } } } },
} satisfies Prisma.QuoteRequestInclude;

type CustomerRecord = Prisma.QuoteRequestGetPayload<{ include: typeof customerInclude }>;
type AdminRecord = Prisma.QuoteRequestGetPayload<{ include: typeof adminInclude }>;
type MessageRecord = AdminRecord['messages'][number];
type TechnicianRecord = AdminRecord['assignments'][number]['technician'];

export const imageUrl = (imageId: string) => `/api/v1/files/quote-images/${imageId}`;

export function toCustomerRequest(r: CustomerRecord): CustomerQuoteRequest {
  return {
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
    description: r.description,
    additionalNotes: r.additionalNotes,
    service: r.service,
    images: r.images.map((img) => ({
      id: img.id,
      url: imageUrl(img.id),
      originalName: img.originalName,
      mimeType: img.mimeType,
      size: img.size,
      createdAt: img.createdAt.toISOString(),
    })),
    statusHistory: r.statusHistory.map((h) => ({
      id: h.id,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      note: h.note,
      createdAt: h.createdAt.toISOString(),
    })),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export function toMessage(m: MessageRecord, companyName: string): RequestMessage {
  return {
    id: m.id,
    body: m.body,
    fromStaff: m.fromStaff,
    senderName: m.fromStaff ? companyName : m.sender ? `${m.sender.firstName} ${m.sender.lastName}`.trim() : 'Customer',
    createdAt: m.createdAt.toISOString(),
    readAt: m.readAt?.toISOString() ?? null,
  };
}

export function toTechnicianSummary(t: TechnicianRecord, activeAssignments?: number): TechnicianSummary {
  return {
    id: t.id,
    name: t.name,
    email: t.email,
    phone: t.phone,
    whatsapp: t.whatsapp,
    role: t.role,
    skills: t.skills,
    imageUrl: t.imageUrl,
    imageKey: t.imageKey,
    status: t.status,
    userId: t.userId,
    ...(activeAssignments !== undefined ? { activeAssignments } : {}),
    createdAt: t.createdAt.toISOString(),
  };
}

export function toAdminRequest(r: AdminRecord, companyName: string): AdminQuoteRequest {
  return {
    ...toCustomerRequest(r),
    customerId: r.customerId,
    internalNotes: r.notes.map((n) => ({
      id: n.id,
      body: n.body,
      author: n.author ? { id: n.author.id, name: `${n.author.firstName} ${n.author.lastName}`.trim() } : { id: '', name: 'Deleted user' },
      createdAt: n.createdAt.toISOString(),
    })),
    assignments: r.assignments.map((a) => ({
      id: a.id,
      technician: toTechnicianSummary(a.technician),
      createdAt: a.createdAt.toISOString(),
    })),
    messages: r.messages.map((m) => toMessage(m, companyName)),
  };
}
