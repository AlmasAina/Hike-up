import sanitizeHtml from 'sanitize-html';

/**
 * Allow-list sanitiser for rich text authored in the admin editor (services, projects, legal …).
 * Scripts, inline event handlers, iframes and style attributes are stripped.
 */
const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote', 'code', 'pre',
    'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'hr', 'span',
  ],
  allowedAttributes: { a: ['href', 'title', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
  },
};

export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return '';
  return sanitizeHtml(html, RICH_TEXT_OPTIONS).trim();
}

/** Removes all markup from user supplied plain text (defence in depth — React escapes on render). */
export function sanitizePlainText(text: string | null | undefined): string {
  if (!text) return '';
  return sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} }).trim();
}

/** Escapes text for safe interpolation into HTML email templates. */
export function escapeHtml(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
