import type { Prisma } from '@prisma/client';
import type { AuthUser } from '@hikeup/types';

export const authUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  whatsapp: true,
  avatarUrl: true,
  status: true,
  emailVerifiedAt: true,
  createdAt: true,
  roles: { select: { role: { select: { name: true } } } },
} satisfies Prisma.UserSelect;

export type AuthUserRecord = Prisma.UserGetPayload<{ select: typeof authUserSelect }>;

export function toAuthUser(user: AuthUserRecord): AuthUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    whatsapp: user.whatsapp,
    avatarUrl: user.avatarUrl,
    roles: user.roles.map((r) => r.role.name),
    emailVerified: Boolean(user.emailVerifiedAt),
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  };
}
