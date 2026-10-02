import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { RoleName } from '@prisma/client';
import { RolesGuard } from './roles.guard';

function context(roles: RoleName[] | null): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user: roles ? { id: 'u1', roles } : undefined }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);
  const requireRoles = (roles: RoleName[] | undefined) => jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles);

  afterEach(() => jest.restoreAllMocks());

  it('allows routes without role metadata', () => {
    requireRoles(undefined);
    expect(guard.canActivate(context(['CUSTOMER']))).toBe(true);
  });

  it('allows a user holding a required role', () => {
    requireRoles(['ADMIN']);
    expect(guard.canActivate(context(['ADMIN']))).toBe(true);
  });

  it('lets SUPER_ADMIN satisfy ADMIN requirements', () => {
    requireRoles(['ADMIN']);
    expect(guard.canActivate(context(['SUPER_ADMIN']))).toBe(true);
  });

  it('rejects customers on admin routes', () => {
    requireRoles(['SUPER_ADMIN', 'ADMIN']);
    expect(() => guard.canActivate(context(['CUSTOMER']))).toThrow(ForbiddenException);
  });

  it('rejects staff on manager-only routes', () => {
    requireRoles(['SUPER_ADMIN', 'ADMIN']);
    expect(() => guard.canActivate(context(['STAFF']))).toThrow(ForbiddenException);
  });

  it('rejects anonymous requests on protected routes', () => {
    requireRoles(['CUSTOMER']);
    expect(() => guard.canActivate(context(null))).toThrow(ForbiddenException);
  });
});
