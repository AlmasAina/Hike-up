"use strict";
/**
 * Domain enums shared by the API and the web app.
 * Values mirror the PostgreSQL enums declared in database/schema.prisma.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_QUOTE_IMAGES = exports.MAX_IMAGE_BYTES = exports.ALLOWED_IMAGE_MIME_TYPES = exports.NOTIFICATION_TYPES = exports.USER_STATUSES = exports.CONTACT_MESSAGE_STATUSES = exports.TECHNICIAN_STATUSES = exports.SERVICE_FEATURE_TYPES = exports.FEATURE_AVAILABILITY = exports.PUBLISH_STATUSES = exports.CONTACT_METHOD_LABELS = exports.CONTACT_METHODS = exports.PROPERTY_TYPE_LABELS = exports.PROPERTY_TYPES = exports.REQUEST_TYPE_LABELS = exports.REQUEST_TYPES = exports.QUOTE_STATUS_LABELS = exports.ACTIVE_QUOTE_STATUSES = exports.PENDING_QUOTE_STATUSES = exports.QUOTE_STATUSES = exports.MANAGER_ROLES = exports.BACKOFFICE_ROLES = exports.ROLES = void 0;
exports.ROLES = ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'CUSTOMER'];
/** Roles that may sign in to /admin. */
exports.BACKOFFICE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'STAFF'];
/** Roles with full content management access. */
exports.MANAGER_ROLES = ['SUPER_ADMIN', 'ADMIN'];
exports.QUOTE_STATUSES = [
    'NEW',
    'CONTACTED',
    'IN_PROGRESS',
    'QUOTED',
    'APPROVED',
    'REJECTED',
    'COMPLETED',
];
/** Statuses that count as "pending" (awaiting progress) on dashboards. */
exports.PENDING_QUOTE_STATUSES = ['NEW', 'CONTACTED', 'QUOTED'];
exports.ACTIVE_QUOTE_STATUSES = ['IN_PROGRESS', 'APPROVED'];
exports.QUOTE_STATUS_LABELS = {
    NEW: 'New',
    CONTACTED: 'Contacted',
    IN_PROGRESS: 'In Progress',
    QUOTED: 'Quoted',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    COMPLETED: 'Completed',
};
exports.REQUEST_TYPES = ['QUOTE', 'SERVICE', 'MAINTENANCE'];
exports.REQUEST_TYPE_LABELS = {
    QUOTE: 'Quote Request',
    SERVICE: 'Service Request',
    MAINTENANCE: 'Maintenance Request',
};
exports.PROPERTY_TYPES = [
    'RESIDENTIAL',
    'COMMERCIAL',
    'OFFICE',
    'APARTMENT',
    'VILLA',
    'OTHER',
];
exports.PROPERTY_TYPE_LABELS = {
    RESIDENTIAL: 'Residential',
    COMMERCIAL: 'Commercial',
    OFFICE: 'Office',
    APARTMENT: 'Apartment',
    VILLA: 'Villa',
    OTHER: 'Other',
};
exports.CONTACT_METHODS = ['PHONE', 'WHATSAPP', 'EMAIL'];
exports.CONTACT_METHOD_LABELS = {
    PHONE: 'Phone',
    WHATSAPP: 'WhatsApp',
    EMAIL: 'Email',
};
exports.PUBLISH_STATUSES = ['DRAFT', 'PUBLISHED'];
exports.FEATURE_AVAILABILITY = ['INCLUDED', 'NOT_INCLUDED', 'CUSTOM'];
exports.SERVICE_FEATURE_TYPES = ['BENEFIT', 'COVERAGE', 'PROCESS_STEP'];
exports.TECHNICIAN_STATUSES = ['ACTIVE', 'INACTIVE'];
exports.CONTACT_MESSAGE_STATUSES = ['NEW', 'READ', 'REPLIED', 'ARCHIVED'];
exports.USER_STATUSES = ['ACTIVE', 'DISABLED'];
exports.NOTIFICATION_TYPES = [
    'QUOTE_REQUEST_CREATED',
    'QUOTE_STATUS_CHANGED',
    'REQUEST_ASSIGNED',
    'REQUEST_MESSAGE',
    'CONTACT_MESSAGE',
    'SYSTEM',
];
/** Image formats accepted by every upload endpoint. */
exports.ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
exports.MAX_IMAGE_BYTES = 5 * 1024 * 1024;
exports.MAX_QUOTE_IMAGES = 6;
//# sourceMappingURL=enums.js.map