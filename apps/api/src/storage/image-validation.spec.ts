import { BadRequestException } from '@nestjs/common';
import { assertValidImage, detectImageType } from './image-validation';

const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(16)]);
const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(16)]);
const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), Buffer.alloc(8)]);
const file = (buffer: Buffer, mimetype: string, size = buffer.length) => ({ buffer, mimetype, size, originalname: 'x' });

describe('image validation', () => {
  it('detects JPEG, PNG and WEBP by magic bytes', () => {
    expect(detectImageType(jpeg)?.mime).toBe('image/jpeg');
    expect(detectImageType(png)?.mime).toBe('image/png');
    expect(detectImageType(webp)?.mime).toBe('image/webp');
  });

  it('rejects files whose content is not an image even with an image MIME type', () => {
    const exe = Buffer.concat([Buffer.from('MZ'), Buffer.alloc(30)]);
    expect(() => assertValidImage(file(exe, 'image/png'))).toThrow(BadRequestException);
  });

  it('rejects SVG / HTML payloads', () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    expect(() => assertValidImage(file(svg, 'image/svg+xml'))).toThrow('Only JPEG, PNG and WEBP');
  });

  it('rejects oversized files', () => {
    expect(() => assertValidImage(file(png, 'image/png', 6 * 1024 * 1024))).toThrow('5 MB');
  });

  it('rejects a missing file', () => {
    expect(() => assertValidImage(undefined)).toThrow('An image file is required');
  });

  it('accepts valid images', () => {
    expect(assertValidImage(file(webp, 'image/webp'))).toEqual({ mime: 'image/webp', ext: 'webp' });
  });
});
