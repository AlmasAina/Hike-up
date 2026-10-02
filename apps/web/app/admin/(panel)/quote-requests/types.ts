import type { ContactMethod, PropertyType, QuoteStatus, RequestType } from '@hikeup/types';

/** Row shape returned by GET /admin/quote-requests */
export interface AdminRequestRow {
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
  service: { id: string; title: string; slug: string } | null;
  technicians: { id: string; name: string }[];
  imageCount: number;
  unreadMessages: number;
  createdAt: string;
}
