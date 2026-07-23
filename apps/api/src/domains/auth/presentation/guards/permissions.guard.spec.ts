import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { Permission } from '../../domain/permissions';

describe('PermissionsGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;
  const guard = new PermissionsGuard(reflector);

  function context(permissions: Permission[] | undefined) {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user: permissions
            ? { id: 'u1', role: 'USER', permissions }
            : undefined,
        }),
      }),
    } as never;
  }

  it('allows when no permissions required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    expect(guard.canActivate(context([Permission.PROFILE_READ]))).toBe(true);
  });

  it('allows when user has all required permissions', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Permission.PROFILE_READ]);
    expect(
      guard.canActivate(context([Permission.PROFILE_READ, Permission.PROFILE_WRITE])),
    ).toBe(true);
  });

  it('rejects missing permission', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Permission.ADMIN_ACCESS]);
    expect(() => guard.canActivate(context([Permission.PROFILE_READ]))).toThrow(
      ForbiddenException,
    );
  });
});
