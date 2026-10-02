import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface RequestMeta {
  ip: string | null;
  userAgent: string | null;
}

export function extractRequestMeta(req: Request): RequestMeta {
  const ua = req.headers['user-agent'];
  return {
    ip: req.ip ?? null,
    userAgent: typeof ua === 'string' ? ua.slice(0, 512) : null,
  };
}

/** Injects the caller's IP address and user agent (used for audit logs and abuse prevention). */
export const ReqMeta = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestMeta =>
  extractRequestMeta(ctx.switchToHttp().getRequest<Request>()),
);
