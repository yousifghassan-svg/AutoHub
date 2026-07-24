import { UserRole } from '@autohub/database';

/** Fine-grained permissions used by @Permissions() guard. */
export enum Permission {
  PROFILE_READ = 'profile:read',
  PROFILE_WRITE = 'profile:write',

  USERS_READ = 'users:read',
  USERS_WRITE = 'users:write',

  LISTINGS_CREATE = 'listings:create',
  LISTINGS_READ = 'listings:read',
  LISTINGS_UPDATE = 'listings:update',
  LISTINGS_DELETE = 'listings:delete',
  LISTINGS_MODERATE = 'listings:moderate',

  PLATES_READ = 'plates:read',
  PLATES_WRITE = 'plates:write',

  MEDIA_UPLOAD = 'media:upload',
  MEDIA_READ = 'media:read',
  MEDIA_DELETE = 'media:delete',

  DEALERS_MANAGE = 'dealers:manage',

  REPORTS_READ = 'reports:read',
  REPORTS_WRITE = 'reports:write',

  SETTINGS_READ = 'settings:read',
  SETTINGS_WRITE = 'settings:write',

  STATS_READ = 'stats:read',

  ADMIN_ACCESS = 'admin:access',
  SYSTEM_MANAGE = 'system:manage',
}

const USER_PERMISSIONS: Permission[] = [
  Permission.PROFILE_READ,
  Permission.PROFILE_WRITE,
  Permission.LISTINGS_CREATE,
  Permission.LISTINGS_READ,
  Permission.LISTINGS_UPDATE,
  Permission.LISTINGS_DELETE,
  Permission.MEDIA_UPLOAD,
  Permission.MEDIA_READ,
  Permission.MEDIA_DELETE,
  Permission.REPORTS_WRITE,
];

const DEALER_PERMISSIONS: Permission[] = [
  ...USER_PERMISSIONS,
  Permission.DEALERS_MANAGE,
];

const SUPPORT_PERMISSIONS: Permission[] = [
  Permission.PROFILE_READ,
  Permission.PROFILE_WRITE,
  Permission.ADMIN_ACCESS,
  Permission.USERS_READ,
  Permission.LISTINGS_READ,
  Permission.REPORTS_READ,
  Permission.REPORTS_WRITE,
  Permission.STATS_READ,
];

const DEALER_MANAGER_PERMISSIONS: Permission[] = [
  Permission.PROFILE_READ,
  Permission.PROFILE_WRITE,
  Permission.ADMIN_ACCESS,
  Permission.DEALERS_MANAGE,
  Permission.LISTINGS_READ,
  Permission.STATS_READ,
  Permission.USERS_READ,
];

const MODERATOR_PERMISSIONS: Permission[] = [
  ...USER_PERMISSIONS,
  Permission.ADMIN_ACCESS,
  Permission.USERS_READ,
  Permission.LISTINGS_MODERATE,
  Permission.PLATES_READ,
  Permission.PLATES_WRITE,
  Permission.REPORTS_READ,
  Permission.REPORTS_WRITE,
  Permission.STATS_READ,
  Permission.MEDIA_READ,
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...MODERATOR_PERMISSIONS,
  Permission.USERS_WRITE,
  Permission.DEALERS_MANAGE,
  Permission.SETTINGS_READ,
  Permission.SETTINGS_WRITE,
  Permission.MEDIA_DELETE,
  Permission.LISTINGS_DELETE,
];

const SUPER_ADMIN_PERMISSIONS: Permission[] = [
  ...ADMIN_PERMISSIONS,
  Permission.SYSTEM_MANAGE,
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  USER: USER_PERMISSIONS,
  DEALER: DEALER_PERMISSIONS,
  SUPPORT: SUPPORT_PERMISSIONS,
  DEALER_MANAGER: DEALER_MANAGER_PERMISSIONS,
  MODERATOR: MODERATOR_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  SUPER_ADMIN: SUPER_ADMIN_PERMISSIONS,
};

export function permissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? USER_PERMISSIONS;
}

export function isStaffRole(role: UserRole): boolean {
  return (
    role === UserRole.SUPPORT ||
    role === UserRole.DEALER_MANAGER ||
    role === UserRole.MODERATOR ||
    role === UserRole.ADMIN ||
    role === UserRole.SUPER_ADMIN
  );
}
