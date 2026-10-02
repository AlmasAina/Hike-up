/**
 * Domain enums shared by the API and the web app.
 * Values mirror the PostgreSQL enums declared in database/schema.prisma.
 */

export const ROLES = ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'CUSTOMER'] as const;
export type RoleName = (typeof ROLES)[number];

/** Roles that may sign in to /admin. */
export const BACKOFFICE_ROLES: readonly RoleName[] = ['SUPER_ADMIN', 'ADMIN', 'STAFF'];
/** Roles with full content management access. */
export const MANAGER_ROLES: readonly RoleName[] = ['SUPER_ADMIN', 'ADMIN'];

export const QUOTE_STATUSES = [
  'NEW',
  'CONTACTED',
  'IN_PROGRESS',
  'QUOTED',
  'APPROVED',
  'REJECTED',
  'COMPLETED',
] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

/** Statuses that count as "pending" (awaiting progress) on dashboards. */
export const PENDING_QUOTE_STATUSES: readonly QuoteStatus[] = ['NEW', 'CONTACTED', 'QUOTED'];
export const ACTIVE_QUOTE_STATUSES: readonly QuoteStatus[] = ['IN_PROGRESS', 'APPROVED'];

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  IN_PROGRESS: 'In Progress',
  QUOTED: 'Quoted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
};

export const REQUEST_TYPES = ['QUOTE', 'SERVICE', 'MAINTENANCE'] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];
export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  QUOTE: 'Quote Request',
  SERVICE: 'Service Request',
  MAINTENANCE: 'Maintenance Request',
};

export const PROPERTY_TYPES = [
  'RESIDENTIAL',
  'COMMERCIAL',
  'OFFICE',
  'APARTMENT',
  'VILLA',
  'OTHER',
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial',
  OFFICE: 'Office',
  APARTMENT: 'Apartment',
  VILLA: 'Villa',
  OTHER: 'Other',
};

export const CONTACT_METHODS = ['PHONE', 'WHATSAPP', 'EMAIL'] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];
export const CONTACT_METHOD_LABELS: Record<ContactMethod, string> = {
  PHONE: 'Phone',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
};

export const PUBLISH_STATUSES = ['DRAFT', 'PUBLISHED'] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const FEATURE_AVAILABILITY = ['INCLUDED', 'NOT_INCLUDED', 'CUSTOM'] as const;
export type FeatureAvailability = (typeof FEATURE_AVAILABILITY)[number];

export const SERVICE_FEATURE_TYPES = ['BENEFIT', 'COVERAGE', 'PROCESS_STEP'] as const;
export type ServiceFeatureType = (typeof SERVICE_FEATURE_TYPES)[number];

export const TECHNICIAN_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type TechnicianStatus = (typeof TECHNICIAN_STATUSES)[number];

export const CONTACT_MESSAGE_STATUSES = ['NEW', 'READ', 'REPLIED', 'ARCHIVED'] as const;
export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];

export const USER_STATUSES = ['ACTIVE', 'DISABLED'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const NOTIFICATION_TYPES = [
  'QUOTE_REQUEST_CREATED',
  'QUOTE_STATUS_CHANGED',
  'REQUEST_ASSIGNED',
  'REQUEST_MESSAGE',
  'CONTACT_MESSAGE',
  'SYSTEM',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Image formats accepted by every upload endpoint. */
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_QUOTE_IMAGES = 6;
