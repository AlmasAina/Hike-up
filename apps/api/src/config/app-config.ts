import { Injectable } from '@nestjs/common';
import { Env, validateEnv } from './env';

/**
 * Typed, validated configuration available through dependency injection.
 * Use `AppConfig` instead of reading `process.env` anywhere else in the API.
 */
@Injectable()
export class AppConfig {
  readonly env: Env;

  constructor() {
    this.env = validateEnv();
  }

  get isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }

  get isTest(): boolean {
    return this.env.NODE_ENV === 'test';
  }

  /** Origins allowed for CORS and CSRF origin checks. */
  get allowedOrigins(): string[] {
    return Array.from(new Set([this.env.WEB_URL, ...this.env.CORS_ORIGINS]));
  }

  get storagePublicBaseUrl(): string {
    return (this.env.STORAGE_PUBLIC_BASE_URL ?? `${this.env.API_PUBLIC_URL}/uploads`).replace(/\/$/, '');
  }
}
