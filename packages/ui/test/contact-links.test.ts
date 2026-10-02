import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMailtoUrl,
  buildTelUrl,
  buildWhatsAppUrl,
  formatPhoneForDisplay,
  toE164,
  toInternationalDigits,
} from '../src/contact-links';

describe('toInternationalDigits', () => {
  it('keeps numbers already in international format', () => {
    assert.equal(toInternationalDigits('+971 54 788 4035'), '971547884035');
    assert.equal(toInternationalDigits('971547884035'), '971547884035');
  });

  it('converts the 00 international prefix', () => {
    assert.equal(toInternationalDigits('00971547884035'), '971547884035');
  });

  it('converts local UAE numbers with a trunk 0', () => {
    assert.equal(toInternationalDigits('0547884035'), '971547884035');
    assert.equal(toInternationalDigits('054-788-4035'), '971547884035');
  });

  it('prefixes bare 9-digit mobile numbers', () => {
    assert.equal(toInternationalDigits('547884035'), '971547884035');
  });

  it('returns an empty string for empty input', () => {
    assert.equal(toInternationalDigits(''), '');
    assert.equal(toInternationalDigits(undefined), '');
    assert.equal(toInternationalDigits('abc'), '');
  });
});

describe('link builders', () => {
  it('builds wa.me links without a leading plus or local zero', () => {
    assert.equal(buildWhatsAppUrl('0547884035'), 'https://wa.me/971547884035');
  });

  it('URL-encodes the prefilled WhatsApp message', () => {
    assert.equal(
      buildWhatsAppUrl('+971547884035', 'Hello HIKE UP, I need a quote & advice'),
      'https://wa.me/971547884035?text=Hello%20HIKE%20UP%2C%20I%20need%20a%20quote%20%26%20advice',
    );
  });

  it('returns empty strings when nothing is configured', () => {
    assert.equal(buildWhatsAppUrl(''), '');
    assert.equal(buildTelUrl(null), '');
    assert.equal(buildMailtoUrl(' '), '');
  });

  it('builds tel links in E.164', () => {
    assert.equal(buildTelUrl('054 788 4035'), 'tel:+971547884035');
    assert.equal(toE164('00971547884035'), '+971547884035');
  });

  it('builds mailto links with an encoded subject', () => {
    assert.equal(
      buildMailtoUrl('info@example.com', 'Quote HU-1'),
      'mailto:info@example.com?subject=Quote%20HU-1',
    );
  });

  it('formats UAE numbers for display', () => {
    assert.equal(formatPhoneForDisplay('0547884035'), '+971 54 788 4035');
  });
});
