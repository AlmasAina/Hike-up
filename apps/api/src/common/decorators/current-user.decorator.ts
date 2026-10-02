import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest, RequestUser } from '../types/request-user';

/** Injects the authenticated user (or undefined on public routes without a session). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser | undefined =>
    ctx.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
