import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { assertValidImage, type UploadedImageFile } from './image-validation';
import { STORAGE_DRIVER, type StorageDriver, type StoredObject, type StorageVisibility } from './storage.types';

/**
 * Storage façade used by every feature module. Switch between local disk and S3 with
 * STORAGE_DRIVER=local|s3 — no feature code changes required.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(@Inject(STORAGE_DRIVER) private readonly driver: StorageDriver) {}

  /** Validates and stores an image. Returns its key and (public) URL. */
  async uploadImage(
    file: UploadedImageFile | undefined,
    folder: string,
    visibility: StorageVisibility = 'public',
  ): Promise<StoredObject & { mimeType: string; size: number }> {
    const detected = assertValidImage(file);
    const stored = await this.upload({
      buffer: file!.buffer,
      contentType: detected.mime,
      extension: detected.ext,
      folder,
      visibility,
    });
    return { ...stored, mimeType: detected.mime, size: file!.size };
  }

  async upload(input: {
    buffer: Buffer;
    contentType: string;
    extension: string;
    folder: string;
    visibility: StorageVisibility;
  }): Promise<StoredObject> {
    const now = new Date();
    const folder = input.folder.replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'misc';
    const key = [
      input.visibility,
      folder,
      String(now.getUTCFullYear()),
      String(now.getUTCMonth() + 1).padStart(2, '0'),
      `${randomUUID()}.${input.extension}`,
    ].join('/');
    await this.driver.upload({ ...input, folder, key });
    return { key, url: input.visibility === 'public' ? this.driver.getUrl(key) : '' };
  }

  /** Deletes an object; failures are logged rather than breaking the calling operation. */
  async delete(key: string | null | undefined): Promise<void> {
    if (!key) return;
    try {
      await this.driver.delete(key);
    } catch (error) {
      this.logger.warn(`Failed to delete ${key}: ${(error as Error).message}`);
    }
  }

  getUrl(key: string): string {
    return this.driver.getUrl(key);
  }

  getPrivateUrl(key: string, expiresInSeconds = 600): Promise<string | null> {
    return this.driver.getPrivateUrl(key, expiresInSeconds);
  }

  read(key: string): Promise<Buffer> {
    return this.driver.read(key);
  }
}
