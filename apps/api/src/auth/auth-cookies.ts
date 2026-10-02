import type { CookieOptions, Response } from 'express';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '../common/utils/cookies';
import type { AppConfig } from '../config/app-config';
import type { IssuedTokens } from './token.service';

function baseOptions(config: AppConfig): CookieOptions {
  return {
    httpOnly: true,
    secure: config.env.COOKIE_SECURE,
    sameSite: 'lax',
    domain: config.env.COOKIE_DOMAIN,
    path: '/',
  };
}

export function setAuthCookies(res: Response, tokens: IssuedTokens, config: AppConfig): void {
  const base = baseOptions(config);
  res.cookie(ACCESS_COOKIE, tokens.accessToken, { ...base, maxAge: tokens.accessExpiresIn * 1000 });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, { ...base, expires: tokens.refreshExpiresAt });
}

export function clearAuthCookies(res: Response, config: AppConfig): void {
  const base = baseOptions(config);
  res.clearCookie(ACCESS_COOKIE, base);
  res.clearCookie(REFRESH_COOKIE, base);
}
