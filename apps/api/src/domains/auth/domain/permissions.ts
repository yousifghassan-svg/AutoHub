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

  /** Staff admin dealer CRUD (requires ADMIN_ACCESS on admin routes). */
  DEALERS_MANAGE = 'dealers:manage',
  /** Self-serve dealer application. */
  DEALERS_APPLY = 'dealers:apply',
  /** Read own org membership / dashboard (service checks membership). */
  DEALERS_ORG_READ = 'dealers:org:read',
  /** Update own org profile (service checks OWNER/MANAGER). */
  DEALERS_ORG_WRITE = 'dealers:org:write',
  /** Manage org members (service checks OWNER/MANAGER). */
  DEALERS_MEMBERS_MANAGE = 'dealers:members:manage',
  /** Admin approve/reject verification queue. */
  DEALERS_VERIFY = 'dealers:verify',

  REPORTS_READ = 'reports:read',
  REPORTS_WRITE = 'reports:write',

  MESSAGES_READ = 'messages:read',
  MESSAGES_WRITE = 'messages:write',
  MESSAGES_MODERATE = 'messages:moderate',

  SETTINGS_READ = 'settings:read',
  SETTINGS_WRITE = 'settings:write',

  STATS_READ = 'stats:read',

  ADMIN_ACCESS = 'admin:access',
  SYSTEM_MANAGE = 'system:manage',
}

const DEALER_ORG_PERMISSIONS: Permission[] = [
  Permission.DEALERS_APPLY,
  Permission.DEALERS_ORG_READ,
  Permission.DEALERS_ORG_WRITE,
  Permission.DEALERS_MEMBERS_MANAGE,
];

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
  Permission.MESSAGES_READ,
  Permission.MESSAGES_WRITE,
  ...DEALER_ORG_PERMISSIONS,
];

const DEALER_PERMISSIONS: Permission[] = [
  ...USER_PERMISSIONS,
];

const SUPPORT_PERMISSIONS: Permission[] = [
  Permission.PROFILE_READ,
  Permission.PROFILE_WRITE,
  Permission.ADMIN_ACCESS,
  Permission.USERS_READ,
  Permission.LISTINGS_READ,
  Permission.REPORTS_READ,
  Permission.REPORTS_WRITE,
  Permission.MESSAGES_READ,
  Permission.MESSAGES_MODERATE,
  Permission.STATS_READ,
];

const DEALER_MANAGER_PERMISSIONS: Permission[] = [
  Permission.PROFILE_READ,
  Permission.PROFILE_WRITE,
  Permission.ADMIN_ACCESS,
  Permission.DEALERS_MANAGE,
  Permission.DEALERS_VERIFY,
  Permission.LISTINGS_READ,
  Permission.STATS_READ,
  Permission.USERS_READ,
  ...DEALER_ORG_PERMISSIONS,
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
  Permission.MESSAGES_MODERATE,
  Permission.STATS_READ,
  Permission.MEDIA_READ,
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...MODERATOR_PERMISSIONS,
  Permission.USERS_WRITE,
  Permission.DEALERS_MANAGE,
  Permission.DEALERS_VERIFY,
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
