import { escapeHtml } from '../common/utils/sanitize';

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const NAVY = '#0D2A5C';
const GOLD = '#F5A800';

/** Minimal, email-client friendly branded layout (tables + inline styles). */
export function emailLayout(companyName: string, heading: string, bodyHtml: string): string {
  return `<!doctype html>
<html><body style="margin:0;background:#f4f6fa;font-family:Arial,Helvetica,sans-serif;color:#1f2a3d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:${NAVY};padding:20px 28px;color:#fff;font-size:18px;font-weight:bold;letter-spacing:.5px">
${escapeHtml(companyName)}<div style="height:3px;width:48px;background:${GOLD};margin-top:10px"></div></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:20px;color:${NAVY}">${escapeHtml(heading)}</h1>
${bodyHtml}
</td></tr>
<tr><td style="padding:16px 28px;background:#f6f8fb;font-size:12px;color:#6b7890">This message was sent by ${escapeHtml(companyName)}.</td></tr>
</table></td></tr></table></body></html>`;
}

export function button(href: string, label: string): string {
  return `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="background:${GOLD};color:${NAVY};padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">${escapeHtml(label)}</a></p>`;
}

export function detailsTable(rows: [string, string | null | undefined][]): string {
  const body = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#6b7890;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`,
    )
    .join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.5">${body}</table>`;
}

export function paragraph(text: string): string {
  return `<p style="font-size:15px;line-height:1.6;margin:0 0 12px">${escapeHtml(text)}</p>`;
}
