import type { ContactMessageStatus, ContactMethod, FeatureAvailability, NotificationType, PropertyType, PublishStatus, QuoteStatus, RequestType, RoleName, ServiceFeatureType, TechnicianStatus, UserStatus } from './enums';
/** ISO-8601 timestamp string as serialised by the API. */
export type IsoDate = string;
export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export interface ApiErrorBody {
    statusCode: number;
    error: string;
    message: string;
    details?: string[];
    path?: string;
    timestamp?: IsoDate;
}
export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    whatsapp: string | null;
    avatarUrl: string | null;
    roles: RoleName[];
    emailVerified: boolean;
    status: UserStatus;
    createdAt: IsoDate;
}
export interface AuthResponse {
    user: AuthUser;
    /** Returned for API clients; browsers rely on the HTTP-only cookies. */
    accessToken: string;
    expiresIn: number;
}
export interface MediaRef {
    id?: string;
    url: string;
    key?: string | null;
    alt?: string | null;
}
export interface ServiceFeature {
    id: string;
    type: ServiceFeatureType;
    title: string;
    description: string | null;
    sortOrder: number;
}
export interface ServiceFaq {
    id: string;
    question: string;
    answer: string;
    sortOrder: number;
}
export interface ServiceImage {
    id: string;
    url: string;
    key: string | null;
    alt: string | null;
    sortOrder: number;
}
export interface ServiceSummary {
    id: string;
    title: string;
    slug: string;
    shortDescription: string;
    icon: string;
    imageUrl: string | null;
    featured: boolean;
    sortOrder: number;
    status: PublishStatus;
}
export interface ServiceDetail extends ServiceSummary {
    introduction: string | null;
    description: string;
    seoTitle: string | null;
    seoDescription: string | null;
    ogImageUrl: string | null;
    features: ServiceFeature[];
    faqs: ServiceFaq[];
    images: ServiceImage[];
    relatedServices: ServiceSummary[];
    createdAt: IsoDate;
    updatedAt: IsoDate;
}
export interface PackageComparisonRow {
    id: string;
    label: string;
    description: string | null;
    icon: string | null;
    sortOrder: number;
}
export interface PackageFeature {
    id: string;
    comparisonRowId: string | null;
    label: string;
    availability: FeatureAvailability;
    value: string | null;
    showOnCard: boolean;
    sortOrder: number;
}
export interface MaintenancePackage {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    badge: string | null;
    color: string;
    billingLabel: string | null;
    priceLabel: string | null;
    pricingNote: string | null;
    includedHours: string | null;
    sparePartsCoverage: string | null;
    freeLabour: boolean;
    preventiveVisits: string | null;
    maintenanceVisits: string | null;
    featured: boolean;
    active: boolean;
    sortOrder: number;
    features: PackageFeature[];
}
export interface PackagesResponse {
    packages: MaintenancePackage[];
    comparisonRows: PackageComparisonRow[];
}
export interface ProjectImage {
    id: string;
    url: string;
    key: string | null;
    alt: string | null;
    sortOrder: number;
}
export interface Project {
    id: string;
    title: string;
    slug: string;
    location: string | null;
    summary: string | null;
    description: string;
    completedAt: IsoDate | null;
    status: PublishStatus;
    isDemo: boolean;
    sortOrder: number;
    service: Pick<ServiceSummary, 'id' | 'title' | 'slug'> | null;
    images: ProjectImage[];
    coverImageUrl: string | null;
}
export interface Testimonial {
    id: string;
    name: string;
    company: string | null;
    rating: number;
    review: string;
    imageUrl: string | null;
    status: PublishStatus;
    isSample: boolean;
    sortOrder: number;
}
export interface Faq {
    id: string;
    question: string;
    answer: string;
    category: string | null;
    sortOrder: number;
    status: PublishStatus;
}
export interface ContentItem {
    title: string;
    description?: string;
    icon?: string;
}
export interface ContentSection {
    id: string;
    key: string;
    title: string | null;
    subtitle: string | null;
    body: string | null;
    imageUrl: string | null;
    items: ContentItem[];
    updatedAt: IsoDate;
}
export interface LegalPage {
    id: string;
    slug: string;
    title: string;
    content: string;
    published: boolean;
    updatedAt: IsoDate;
}
/** Settings exposed publicly to the website (no secrets). */
export interface PublicSettings {
    companyName: string;
    companyLegalName: string;
    tagline: string;
    logoUrl: string;
    faviconUrl: string;
    email: string;
    phone: string;
    whatsappNumber: string;
    whatsappMessage: string;
    location: string;
    workingHours: string;
    facebookUrl: string;
    instagramUrl: string;
    linkedinUrl: string;
    footerText: string;
    ctaTitle: string;
    ctaText: string;
    seoTitle: string;
    seoDescription: string;
    googleSiteVerification: string;
    gaMeasurementId: string;
    licenceNumber: string;
    showLicenceNumber: boolean;
}
export interface AdminSettings extends PublicSettings {
    notificationEmail: string;
}
export type SettingsKey = keyof AdminSettings;
export interface QuoteRequestImage {
    id: string;
    url: string;
    originalName: string | null;
    mimeType: string;
    size: number;
    createdAt: IsoDate;
}
export interface QuoteStatusHistoryEntry {
    id: string;
    fromStatus: QuoteStatus | null;
    toStatus: QuoteStatus;
    note: string | null;
    createdAt: IsoDate;
}
export interface RequestMessage {
    id: string;
    body: string;
    fromStaff: boolean;
    senderName: string;
    createdAt: IsoDate;
    readAt: IsoDate | null;
}
export interface CustomerQuoteRequest {
    id: string;
    reference: string;
    type: RequestType;
    status: QuoteStatus;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    whatsapp: string | null;
    location: string;
    propertyType: PropertyType;
    preferredContact: ContactMethod;
    description: string;
    additionalNotes: string | null;
    service: Pick<ServiceSummary, 'id' | 'title' | 'slug'> | null;
    images: QuoteRequestImage[];
    statusHistory: QuoteStatusHistoryEntry[];
    createdAt: IsoDate;
    updatedAt: IsoDate;
}
export interface RequestNote {
    id: string;
    body: string;
    author: {
        id: string;
        name: string;
    };
    createdAt: IsoDate;
}
export interface TechnicianSummary {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    role: string | null;
    skills: string[];
    imageUrl: string | null;
    status: TechnicianStatus;
    userId: string | null;
    activeAssignments?: number;
    createdAt: IsoDate;
}
export interface AdminQuoteRequest extends CustomerQuoteRequest {
    customerId: string | null;
    internalNotes: RequestNote[];
    assignments: {
        id: string;
        technician: TechnicianSummary;
        createdAt: IsoDate;
    }[];
    messages: RequestMessage[];
}
export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    body: string | null;
    link: string | null;
    readAt: IsoDate | null;
    createdAt: IsoDate;
}
export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    status: ContactMessageStatus;
    createdAt: IsoDate;
    updatedAt: IsoDate;
}
export interface CustomerSummary {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    whatsapp: string | null;
    status: UserStatus;
    emailVerified: boolean;
    requestCount: number;
    createdAt: IsoDate;
    lastLoginAt: IsoDate | null;
}
export interface AuditLogEntry {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    ip: string | null;
    metadata: Record<string, unknown> | null;
    actor: {
        id: string;
        email: string;
        name: string;
    } | null;
    createdAt: IsoDate;
}
export interface CustomerDashboardStats {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    unreadMessages: number;
    recent: CustomerQuoteRequest[];
}
export interface AdminDashboardStats {
    totals: {
        customers: number;
        newQuoteRequests: number;
        pendingRequests: number;
        activeServices: number;
        activePackages: number;
        projects: number;
        unreadMessages: number;
    };
    requestsByMonth: {
        month: string;
        count: number;
    }[];
    requestsByService: {
        service: string;
        count: number;
    }[];
    customerGrowth: {
        month: string;
        count: number;
    }[];
    recentRequests: Pick<AdminQuoteRequest, 'id' | 'reference' | 'firstName' | 'lastName' | 'status' | 'createdAt' | 'service'>[];
}
