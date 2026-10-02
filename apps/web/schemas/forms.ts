import { CONTACT_METHODS, PROPERTY_TYPES } from '@hikeup/types';
import { z } from 'zod';

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9\s\-()]{6,19}$/, 'Enter a valid phone number, e.g. +971 50 123 4567');
const optionalPhone = z.union([z.literal(''), phone]).optional();
const password = z
  .string()
  .min(8, 'At least 8 characters')
  .max(128)
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/\d/, 'Include at least one number');

export const quoteRequestSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  email: z.string().trim().email('Enter a valid email address'),
  phone,
  whatsapp: optionalPhone,
  serviceId: z.string().optional(),
  location: z.string().trim().min(2, 'Location is required').max(200),
  propertyType: z.enum(PROPERTY_TYPES, { message: 'Select a property type' }),
  preferredContact: z.enum(CONTACT_METHODS, { message: 'Select how we should contact you' }),
  description: z.string().trim().min(10, 'Please describe the problem (at least 10 characters)').max(5000),
  additionalNotes: z.string().trim().max(3000).optional(),
  website: z.string().max(0).optional(),
});
export type QuoteRequestValues = z.infer<typeof quoteRequestSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(160),
  email: z.string().trim().email('Enter a valid email address'),
  phone: optionalPhone,
  subject: z.string().trim().min(2, 'Subject is required').max(200),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000),
  website: z.string().max(0).optional(),
});
export type ContactValues = z.infer<typeof contactSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').max(80),
    lastName: z.string().trim().min(1, 'Last name is required').max(80),
    email: z.string().trim().email('Enter a valid email address'),
    phone,
    whatsapp: optionalPhone,
    password,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, { message: 'Please accept the terms to continue' }),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email: z.string().trim().email('Enter a valid email address') });

export const resetPasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1, 'Current password is required'), newPassword: password, confirmPassword: z.string() })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  phone: optionalPhone,
  whatsapp: optionalPhone,
});
export type ProfileValues = z.infer<typeof profileSchema>;

/** Strips empty optional strings before sending to the API. */
export function compact<T extends Record<string, unknown>>(values: T): Partial<T> {
  return Object.fromEntries(Object.entries(values).filter(([, v]) => v !== '' && v !== undefined)) as Partial<T>;
}
