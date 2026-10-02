export type StorageVisibility = 'public' | 'private';

export interface UploadInput {
  buffer: Buffer;
  contentType: string;
  /** Logical folder, e.g. "services", "projects", "quote-requests". */
  folder: string;
  extension: string;
  visibility: StorageVisibility;
}

export interface StoredObject {
  key: string;
  /** Public URL for public objects. Private objects are served through authorised endpoints. */
  url: string;
}

export interface StorageDriver {
  upload(input: UploadInput & { key: string }): Promise<void>;
  delete(key: string): Promise<void>;
  /** Public URL for a public key. */
  getUrl(key: string): string;
  /** Short-lived URL (S3) or null (local – stream instead) for a private key. */
  getPrivateUrl(key: string, expiresInSeconds: number): Promise<string | null>;
  /** Reads an object (used to stream private local files). */
  read(key: string): Promise<Buffer>;
}

export const STORAGE_DRIVER = Symbol('STORAGE_DRIVER');
