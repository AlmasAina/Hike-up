'use client';

import type { ApiErrorBody } from '@hikeup/types';
import { publicEnv } from './env';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details: string[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Human readable message including validation details. */
  get description(): string {
    return this.details.length ? `${this.message}: ${this.details.join('; ')}` : this.message;
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: Method;
  body?: unknown;
  /** Skip the automatic refresh-and-retry on 401 */
  noRefresh?: boolean;
  signal?: AbortSignal;
}

let refreshPromise: Promise<boolean> | null = null;

/** Refreshes the session once, even when many requests fail with 401 at the same time. */
async function refreshSession(): Promise<boolean> {
  refreshPromise ??= fetch(`${publicEnv.apiBase}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' },
    body: '{}',
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      setTimeout(() => (refreshPromise = null), 0);
    });
  return refreshPromise;
}

async function parseError(res: Response): Promise<ApiError> {
  let body: Partial<ApiErrorBody> = {};
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    // non-JSON error
  }
  const fallback = res.status >= 500 ? 'Something went wrong on our side. Please try again.' : 'Request failed';
  return new ApiError(res.status, body.message ?? fallback, body.details ?? []);
}

/**
 * Browser API client. Uses the HTTP-only session cookies (same-origin via the Next.js proxy) and
 * transparently refreshes an expired access token once.
 */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const doFetch = () =>
    fetch(`${publicEnv.apiBase}${path}`, {
      method: options.method ?? 'GET',
      credentials: 'include',
      signal: options.signal,
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'fetch',
        ...(options.body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}),
      },
      body: options.body === undefined ? undefined : isForm ? (options.body as FormData) : JSON.stringify(options.body),
    });

  let res: Response;
  try {
    res = await doFetch();
  } catch {
    throw new ApiError(0, 'Network error — please check your connection and try again.');
  }

  if (res.status === 401 && !options.noRefresh && !path.startsWith('/auth/')) {
    if (await refreshSession()) res = await doFetch();
  }
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/**
 * Multipart upload with progress reporting (XMLHttpRequest exposes upload progress; fetch does not).
 */
export function uploadWithProgress<T>(
  path: string,
  form: FormData,
  onProgress?: (percent: number) => void,
  method: 'POST' | 'PUT' = 'POST',
): Promise<T> {
  const send = () =>
    new Promise<{ status: number; body: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, `${publicEnv.apiBase}${path}`);
      xhr.withCredentials = true;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('X-Requested-With', 'fetch');
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) onProgress(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () => resolve({ status: xhr.status, body: xhr.responseText });
      xhr.onerror = () => reject(new ApiError(0, 'Network error — please check your connection and try again.'));
      xhr.send(form);
    });

  return (async () => {
    let result = await send();
    if (result.status === 401 && (await refreshSession())) result = await send();
    if (result.status < 200 || result.status >= 300) {
      let body: Partial<ApiErrorBody> = {};
      try {
        body = JSON.parse(result.body) as ApiErrorBody;
      } catch {
        // ignore
      }
      throw new ApiError(result.status, body.message ?? 'Upload failed', body.details ?? []);
    }
    onProgress?.(100);
    return (result.body ? JSON.parse(result.body) : undefined) as T;
  })();
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.description;
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}
