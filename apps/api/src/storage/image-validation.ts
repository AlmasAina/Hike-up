import { BadRequestException } from '@nestjs/common';
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_BYTES, type AllowedImageMimeType } from '@hikeup/types';

export interface DetectedImage {
  mime: AllowedImageMimeType;
  ext: 'jpg' | 'png' | 'webp';
}

/**
 * Detects JPEG / PNG / WEBP from the file's magic bytes. The client-supplied MIME type and file
 * name are never trusted, so renamed executables or SVG/HTML payloads are rejected.
 */
export function detectImageType(buffer: Buffer): DetectedImage | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' };
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) {
    return { mime: 'image/png', ext: 'png' };
  }
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return { mime: 'image/webp', ext: 'webp' };
  }
  return null;
}

export interface UploadedImageFile {
  buffer: Buffer;
  size: number;
  mimetype: string;
  originalname: string;
}

/** Validates size, declared MIME type and actual content of an uploaded image. */
export function assertValidImage(file: UploadedImageFile | undefined): DetectedImage {
  if (!file || !file.buffer?.length) throw new BadRequestException('An image file is required');
  if (file.size > MAX_IMAGE_BYTES) {
    throw new BadRequestException(`Images must be ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} MB or smaller`);
  }
  if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
    throw new BadRequestException('Only JPEG, PNG and WEBP images are allowed');
  }
  const detected = detectImageType(file.buffer);
  if (!detected) throw new BadRequestException('File content is not a valid JPEG, PNG or WEBP image');
  return detected;
}

/** Multer options shared by every image upload endpoint (in-memory, size & count limited). */
export const imageMulterOptions = (maxFiles = 1) => ({
  limits: { fileSize: MAX_IMAGE_BYTES, files: maxFiles, fields: 40, fieldSize: 64 * 1024 },
  fileFilter: (
    _req: unknown,
    file: { mimetype: string },
    cb: (error: Error | null, accept: boolean) => void,
  ) => {
    if ((ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.mimetype)) cb(null, true);
    else cb(new BadRequestException('Only JPEG, PNG and WEBP images are allowed'), false);
  },
});
