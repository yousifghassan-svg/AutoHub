import type { ListingStatus, UserRole } from '@autohub/database';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { Permission } from '../../auth/domain/permissions';
import { isAdminLike, isModeratorLike } from '../../listings/domain/listing.policies';

export function plateDomainWhere() {
  return { domain: 'PLATE' as const };
}

export function canManagePlate(input: {
  actorId: string;
  actorRole: UserRole;
  sellerId: string | null | undefined;
}): boolean {
  if (isAdminLike(input.actorRole)) return true;
  return Boolean(input.sellerId && input.sellerId === input.actorId);
}

export function canVerifyPlate(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return (
    isModeratorLike(role) || permissions.includes(Permission.PLATES_WRITE)
  );
}

export function canViewPlate(input: {
  status: ListingStatus;
  sellerId: string | null | undefined;
  actor?: AuthenticatedUser;
}): boolean {
  if (input.status === 'ACTIVE') return true;
  if (!input.actor) return false;
  if (isModeratorLike(input.actor.role)) return true;
  return Boolean(input.sellerId && input.sellerId === input.actor.id);
}
