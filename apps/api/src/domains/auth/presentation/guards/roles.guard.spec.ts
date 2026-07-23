import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Permission } from '../../domain/permissions';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  const guard = new RolesGuard(reflector);

  function contextWithUser(role?: string) {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () =>
          role
            ? {
                user: {
                  id: 'u1',
                  role,
                  permissions: [Permission.PROFILE_READ],
                },
              }
            : {},
      }),
    } as never;
  }

  it('allows when no roles required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    expect(guard.canActivate(contextWithUser('USER'))).toBe(true);
  });

  it('allows matching role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);
    expect(guard.canActivate(contextWithUser('ADMIN'))).toBe(true);
  });

  it('allows SUPER_ADMIN for any role requirement', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);
    expect(guard.canActivate(contextWithUser('SUPER_ADMIN'))).toBe(true);
  });

  it('rejects mismatched role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);
    expect(() => guard.canActivate(contextWithUser('USER'))).toThrow(ForbiddenException);
  });
});
