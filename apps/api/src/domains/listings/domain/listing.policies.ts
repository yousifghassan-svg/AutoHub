import type { UserRole } from '@autohub/database';
import { Permission } from '../../auth/domain/permissions';

export function isAdminLike(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function isModeratorLike(role: UserRole): boolean {
  return isAdminLike(role) || role === 'MODERATOR';
}

export function canModerateListings(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return (
    isModeratorLike(role) || permissions.includes(Permission.LISTINGS_MODERATE)
  );
}

export function canManageListing(input: {
  actorId: string;
  actorRole: UserRole;
  sellerId: string | null | undefined;
}): boolean {
  if (isAdminLike(input.actorRole)) return true;
  return Boolean(input.sellerId && input.sellerId === input.actorId);
}
