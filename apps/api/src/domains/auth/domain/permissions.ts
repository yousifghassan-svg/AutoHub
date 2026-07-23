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
  MEDIA_UPLOAD = 'media:upload',
  MEDIA_READ = 'media:read',
  MEDIA_DELETE = 'media:delete',
  DEALERS_MANAGE = 'dealers:manage',
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
];

const DEALER_PERMISSIONS: Permission[] = [
  ...USER_PERMISSIONS,
  Permission.DEALERS_MANAGE,
];

const MODERATOR_PERMISSIONS: Permission[] = [
  ...USER_PERMISSIONS,
  Permission.USERS_READ,
  Permission.LISTINGS_MODERATE,
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...MODERATOR_PERMISSIONS,
  Permission.USERS_WRITE,
  Permission.DEALERS_MANAGE,
  Permission.ADMIN_ACCESS,
];

const SUPER_ADMIN_PERMISSIONS: Permission[] = [
  ...ADMIN_PERMISSIONS,
  Permission.SYSTEM_MANAGE,
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  USER: USER_PERMISSIONS,
  DEALER: DEALER_PERMISSIONS,
  MODERATOR: MODERATOR_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  SUPER_ADMIN: SUPER_ADMIN_PERMISSIONS,
};

export function permissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? USER_PERMISSIONS;
}
