/**
 * Domain enums shared by the API and the web app.
 * Values mirror the PostgreSQL enums declared in database/schema.prisma.
 */
export declare const ROLES: readonly ["SUPER_ADMIN", "ADMIN", "STAFF", "CUSTOMER"];
export type RoleName = (typeof ROLES)[number];
/** Roles that may sign in to /admin. */
export declare const BACKOFFICE_ROLES: readonly RoleName[];
/** Roles with full content management access. */
export declare const MANAGER_ROLES: readonly RoleName[];
export declare const QUOTE_STATUSES: readonly ["NEW", "CONTACTED", "IN_PROGRESS", "QUOTED", "APPROVED", "REJECTED", "COMPLETED"];
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];
/** Statuses that count as "pending" (awaiting progress) on dashboards. */
export declare const PENDING_QUOTE_STATUSES: readonly QuoteStatus[];
export declare const ACTIVE_QUOTE_STATUSES: readonly QuoteStatus[];
export declare const QUOTE_STATUS_LABELS: Record<QuoteStatus, string>;
export declare const REQUEST_TYPES: readonly ["QUOTE", "SERVICE", "MAINTENANCE"];
export type RequestType = (typeof REQUEST_TYPES)[number];
export declare const REQUEST_TYPE_LABELS: Record<RequestType, string>;
export declare const PROPERTY_TYPES: readonly ["RESIDENTIAL", "COMMERCIAL", "OFFICE", "APARTMENT", "VILLA", "OTHER"];
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export declare const PROPERTY_TYPE_LABELS: Record<PropertyType, string>;
export declare const CONTACT_METHODS: readonly ["PHONE", "WHATSAPP", "EMAIL"];
export type ContactMethod = (typeof CONTACT_METHODS)[number];
export declare const CONTACT_METHOD_LABELS: Record<ContactMethod, string>;
export declare const PUBLISH_STATUSES: readonly ["DRAFT", "PUBLISHED"];
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];
export declare const FEATURE_AVAILABILITY: readonly ["INCLUDED", "NOT_INCLUDED", "CUSTOM"];
export type FeatureAvailability = (typeof FEATURE_AVAILABILITY)[number];
export declare const SERVICE_FEATURE_TYPES: readonly ["BENEFIT", "COVERAGE", "PROCESS_STEP"];
export type ServiceFeatureType = (typeof SERVICE_FEATURE_TYPES)[number];
export declare const TECHNICIAN_STATUSES: readonly ["ACTIVE", "INACTIVE"];
export type TechnicianStatus = (typeof TECHNICIAN_STATUSES)[number];
export declare const CONTACT_MESSAGE_STATUSES: readonly ["NEW", "READ", "REPLIED", "ARCHIVED"];
export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];
export declare const USER_STATUSES: readonly ["ACTIVE", "DISABLED"];
export type UserStatus = (typeof USER_STATUSES)[number];
export declare const NOTIFICATION_TYPES: readonly ["QUOTE_REQUEST_CREATED", "QUOTE_STATUS_CHANGED", "REQUEST_ASSIGNED", "REQUEST_MESSAGE", "CONTACT_MESSAGE", "SYSTEM"];
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
/** Image formats accepted by every upload endpoint. */
export declare const ALLOWED_IMAGE_MIME_TYPES: readonly ["image/jpeg", "image/png", "image/webp"];
export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];
export declare const MAX_IMAGE_BYTES: number;
export declare const MAX_QUOTE_IMAGES = 6;
