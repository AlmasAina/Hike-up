"use strict";
/**
 * Helpers that turn centrally configured contact details into wa.me / tel: / mailto: links.
 * Every call/WhatsApp button in the web app goes through these helpers so contact numbers are
 * never hard-coded in components.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COUNTRY_CODE = void 0;
exports.toInternationalDigits = toInternationalDigits;
exports.toE164 = toE164;
exports.buildWhatsAppUrl = buildWhatsAppUrl;
exports.buildTelUrl = buildTelUrl;
exports.buildMailtoUrl = buildMailtoUrl;
exports.formatPhoneForDisplay = formatPhoneForDisplay;
exports.DEFAULT_COUNTRY_CODE = '971';
/**
 * Normalises a phone number into the international digits-only format required by wa.me.
 *
 * Examples (UAE):
 *   "+971 54 788 4035" -> "971547884035"
 *   "00971547884035"   -> "971547884035"
 *   "054 788 4035"     -> "971547884035"  (local trunk "0" replaced with the country code)
 *   "547884035"        -> "971547884035"
 */
function toInternationalDigits(input, countryCode = exports.DEFAULT_COUNTRY_CODE) {
    if (!input)
        return '';
    let digits = input.replace(/[^\d+]/g, '');
    if (digits.startsWith('+'))
        return digits.slice(1).replace(/\D/g, '');
    digits = digits.replace(/\D/g, '');
    if (!digits)
        return '';
    if (digits.startsWith('00'))
        return digits.slice(2);
    if (digits.startsWith(countryCode))
        return digits;
    if (digits.startsWith('0'))
        return countryCode + digits.slice(1);
    // UAE mobile numbers without the trunk prefix are 9 digits (5X XXX XXXX).
    if (digits.length <= 9)
        return countryCode + digits;
    return digits;
}
/** E.164 representation, e.g. "+971547884035". */
function toE164(input, countryCode) {
    const digits = toInternationalDigits(input, countryCode);
    return digits ? `+${digits}` : '';
}
/** Builds https://wa.me/<digits>?text=<encoded message>. Returns '' when no number is configured. */
function buildWhatsAppUrl(number, message, countryCode) {
    const digits = toInternationalDigits(number, countryCode);
    if (!digits)
        return '';
    const text = message?.trim();
    return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`;
}
/** Builds a tel: link using the E.164 number, e.g. "tel:+971547884035". */
function buildTelUrl(number, countryCode) {
    const e164 = toE164(number, countryCode);
    return e164 ? `tel:${e164}` : '';
}
/** Builds a mailto: link with an optional subject line. */
function buildMailtoUrl(email, subject) {
    const address = email?.trim();
    if (!address)
        return '';
    return subject ? `mailto:${address}?subject=${encodeURIComponent(subject)}` : `mailto:${address}`;
}
/**
 * Formats a UAE number for display: "+971 54 788 4035".
 * Falls back to "+<digits>" for numbers that do not match the UAE mobile pattern.
 */
function formatPhoneForDisplay(input, countryCode) {
    const digits = toInternationalDigits(input, countryCode);
    if (!digits)
        return '';
    const uae = /^971(\d{2})(\d{3})(\d{4})$/.exec(digits);
    if (uae)
        return `+971 ${uae[1]} ${uae[2]} ${uae[3]}`;
    return `+${digits}`;
}
//# sourceMappingURL=contact-links.js.map