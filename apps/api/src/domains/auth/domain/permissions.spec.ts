import { Permission, permissionsForRole, ROLE_PERMISSIONS } from './permissions';

describe('permissionsForRole', () => {
  it('gives USER profile, listing, and media permissions', () => {
    const permissions = permissionsForRole('USER');
    expect(permissions).toEqual(
      expect.arrayContaining([
        Permission.PROFILE_READ,
        Permission.PROFILE_WRITE,
        Permission.LISTINGS_CREATE,
        Permission.LISTINGS_READ,
        Permission.LISTINGS_UPDATE,
        Permission.LISTINGS_DELETE,
        Permission.MEDIA_UPLOAD,
        Permission.MEDIA_READ,
        Permission.MEDIA_DELETE,
        Permission.MESSAGES_READ,
        Permission.MESSAGES_WRITE,
      ]),
    );
    expect(permissions).not.toContain(Permission.LISTINGS_MODERATE);
  });

  it('includes moderation and admin access for MODERATOR', () => {
    expect(permissionsForRole('MODERATOR')).toContain(Permission.LISTINGS_MODERATE);
    expect(permissionsForRole('MODERATOR')).toContain(Permission.ADMIN_ACCESS);
  });

  it('maps SUPPORT and DEALER_MANAGER staff permissions', () => {
    expect(permissionsForRole('SUPPORT')).toContain(Permission.REPORTS_READ);
    expect(permissionsForRole('DEALER_MANAGER')).toContain(Permission.DEALERS_MANAGE);
  });

  it('gives SUPER_ADMIN system manage', () => {
    expect(permissionsForRole('SUPER_ADMIN')).toContain(Permission.SYSTEM_MANAGE);
    expect(permissionsForRole('SUPER_ADMIN')).toEqual(
      expect.arrayContaining(ROLE_PERMISSIONS.ADMIN),
    );
  });

  it('maps DEALER manage permission', () => {
    expect(permissionsForRole('DEALER')).toContain(Permission.DEALERS_MANAGE);
  });
});
