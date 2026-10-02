import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AppConfig } from '../../config/app-config';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defence-in-depth for cookie-authenticated requests.
 * Cookies are SameSite=Lax; in addition, state-changing requests that carry an Origin header must
 * originate from an allowed web origin. Requests without cookies (Bearer API clients) are unaffected.
 */
@Injectable()
export class CsrfOriginMiddleware implements NestMiddleware {
  constructor(private readonly config: AppConfig) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    if (SAFE_METHODS.has(req.method)) return next();
    const origin = req.headers.origin;
    const hasCookies = Boolean(req.headers.cookie);
    if (origin && hasCookies && !this.config.allowedOrigins.includes(origin)) {
      throw new ForbiddenException('Cross-origin request blocked');
    }
    next();
  }
}
