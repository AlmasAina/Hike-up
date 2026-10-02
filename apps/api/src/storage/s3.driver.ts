import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NotFoundException } from '@nestjs/common';
import type { StorageDriver, UploadInput } from './storage.types';

/**
 * Production storage on Amazon S3.
 * - Bucket stays private (Block Public Access ON).
 * - Public objects (prefix "public/") are delivered through CloudFront (STORAGE_PUBLIC_BASE_URL).
 * - Private objects (prefix "private/") are only accessible through short-lived presigned URLs.
 * Credentials come from the ECS task role / instance profile; static keys are optional.
 */
export class S3StorageDriver implements StorageDriver {
  private readonly client: S3Client;

  constructor(
    private readonly bucket: string,
    region: string,
    private readonly publicBaseUrl: string,
    credentials?: { accessKeyId: string; secretAccessKey: string },
  ) {
    this.client = new S3Client({ region, ...(credentials ? { credentials } : {}) });
  }

  async upload(input: UploadInput & { key: string }): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.buffer,
        ContentType: input.contentType,
        CacheControl: input.visibility === 'public' ? 'public, max-age=31536000, immutable' : 'private, no-store',
        ServerSideEncryption: 'AES256',
      }),
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  getUrl(key: string): string {
    return `${this.publicBaseUrl}/${key}`;
  }

  async getPrivateUrl(key: string, expiresInSeconds: number): Promise<string | null> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: expiresInSeconds,
    });
  }

  async read(key: string): Promise<Buffer> {
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    if (!result.Body) throw new NotFoundException('File not found');
    return Buffer.from(await result.Body.transformToByteArray());
  }
}
