import { escapeHtml, sanitizePlainText, sanitizeRichText } from './sanitize';

describe('sanitizers', () => {
  it('removes scripts and event handlers from rich text', () => {
    const html = sanitizeRichText('<p onclick="x()">Hi<script>alert(1)</script><img src=x onerror=alert(1)></p>');
    expect(html).toBe('<p>Hi</p>');
  });

  it('keeps safe formatting and forces rel on links', () => {
    const html = sanitizeRichText('<h2>Title</h2><a href="https://example.com">x</a><a href="javascript:alert(1)">y</a>');
    expect(html).toContain('<h2>Title</h2>');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain('javascript:');
  });

  it('strips all markup from plain text', () => {
    expect(sanitizePlainText('<b>Leak</b> in <i>kitchen</i>')).toBe('Leak in kitchen');
  });

  it('escapes HTML for email templates', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });
});
