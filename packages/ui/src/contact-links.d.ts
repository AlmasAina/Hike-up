/**
 * Helpers that turn centrally configured contact details into wa.me / tel: / mailto: links.
 * Every call/WhatsApp button in the web app goes through these helpers so contact numbers are
 * never hard-coded in components.
 */
export declare const DEFAULT_COUNTRY_CODE = "971";
/**
 * Normalises a phone number into the international digits-only format required by wa.me.
 *
 * Examples (UAE):
 *   "+971 54 788 4035" -> "971547884035"
 *   "00971547884035"   -> "971547884035"
 *   "054 788 4035"     -> "971547884035"  (local trunk "0" replaced with the country code)
 *   "547884035"        -> "971547884035"
 */
export declare function toInternationalDigits(input: string | null | undefined, countryCode?: string): string;
/** E.164 representation, e.g. "+971547884035". */
export declare function toE164(input: string | null | undefined, countryCode?: string): string;
/** Builds https://wa.me/<digits>?text=<encoded message>. Returns '' when no number is configured. */
export declare function buildWhatsAppUrl(number: string | null | undefined, message?: string | null, countryCode?: string): string;
/** Builds a tel: link using the E.164 number, e.g. "tel:+971547884035". */
export declare function buildTelUrl(number: string | null | undefined, countryCode?: string): string;
/** Builds a mailto: link with an optional subject line. */
export declare function buildMailtoUrl(email: string | null | undefined, subject?: string): string;
/**
 * Formats a UAE number for display: "+971 54 788 4035".
 * Falls back to "+<digits>" for numbers that do not match the UAE mobile pattern.
 */
export declare function formatPhoneForDisplay(input: string | null | undefined, countryCode?: string): string;
