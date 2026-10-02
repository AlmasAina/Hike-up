import { SetMetadata } from '@nestjs/common';
import type { RoleName } from '@prisma/client';

export const ROLES_KEY = 'roles';

/** Restricts a route to users holding at least one of the given roles. */
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);

/** Content managers: SUPER_ADMIN and ADMIN. */
export const ManagerOnly = () => Roles('SUPER_ADMIN', 'ADMIN');

/** Any back-office user: SUPER_ADMIN, ADMIN or STAFF. */
export const BackOffice = () => Roles('SUPER_ADMIN', 'ADMIN', 'STAFF');
