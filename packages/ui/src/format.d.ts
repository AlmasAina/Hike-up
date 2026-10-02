/** Converts a title into a URL-safe slug. */
export declare function slugify(value: string): string;
/** Collapses a person's first/last name into a display name. */
export declare function fullName(firstName?: string | null, lastName?: string | null): string;
/** Strips HTML tags for use in meta descriptions and plain-text previews. */
export declare function stripHtml(html: string | null | undefined, maxLength?: number): string;
