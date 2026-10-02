"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = slugify;
exports.fullName = fullName;
exports.stripHtml = stripHtml;
/** Converts a title into a URL-safe slug. */
function slugify(value) {
    return value
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 120);
}
/** Collapses a person's first/last name into a display name. */
function fullName(firstName, lastName) {
    return [firstName, lastName].filter(Boolean).join(' ').trim();
}
/** Strips HTML tags for use in meta descriptions and plain-text previews. */
function stripHtml(html, maxLength) {
    if (!html)
        return '';
    const text = html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
    if (!maxLength || text.length <= maxLength)
        return text;
    return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
//# sourceMappingURL=format.js.map