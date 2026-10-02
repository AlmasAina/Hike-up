import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NotFoundException } from '@nestjs/common';
import type { StorageDriver, UploadInput } from './storage.types';

/**
 * Development storage on the local filesystem.
 * Files under "<UPLOAD_DIR>/public" are served statically at /uploads/public; private files are
 * only reachable through authorised API endpoints.
 */
export class LocalStorageDriver implements StorageDriver {
  private readonly root: string;

  constructor(
    uploadDir: string,
    private readonly publicBaseUrl: string,
  ) {
    this.root = path.resolve(uploadDir);
  }

  private resolve(key: string): string {
    const full = path.resolve(this.root, key);
    if (!full.startsWith(this.root + path.sep)) throw new NotFoundException('Invalid file key');
    return full;
  }

  async upload(input: UploadInput & { key: string }): Promise<void> {
    const target = this.resolve(input.key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, input.buffer, { mode: 0o640 });
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolve(key), { force: true });
  }

  getUrl(key: string): string {
    return `${this.publicBaseUrl}/${key}`;
  }

  async getPrivateUrl(): Promise<string | null> {
    return null;
  }

  async read(key: string): Promise<Buffer> {
    try {
      return await readFile(this.resolve(key));
    } catch {
      throw new NotFoundException('File not found');
    }
  }
}
