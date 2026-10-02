import type { RoleName } from '@prisma/client';
import type { Request } from 'express';

/** The authenticated principal attached to `request.user` by JwtAuthGuard. */
export interface RequestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: RoleName[];
}

export interface AuthenticatedRequest extends Request {
  user?: RequestUser;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  roles: RoleName[];
}
