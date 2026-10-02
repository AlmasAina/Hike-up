import { Transform } from 'class-transformer';

/** Trims string input; converts empty strings to undefined so optional fields stay optional. */
export const Trim = () =>
  Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  });

/** Trims & lower-cases e-mail addresses. */
export const NormalizeEmail = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value));

/** Accepts "true"/"false" strings from multipart forms and query strings. */
export const ToBoolean = () =>
  Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  });

/** Nullable string: empty string -> null (lets admins clear a field). */
export const EmptyToNull = () =>
  Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? null : typeof value === 'string' ? value.trim() : value));
