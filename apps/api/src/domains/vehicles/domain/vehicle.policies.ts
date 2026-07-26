import type { ListingCategoryCode, UserRole } from '@autohub/database';
import type { Permission } from '../../auth/domain/permissions';
import {
  canManageListing,
  canModerateListings,
} from '../../listings/domain/listing.policies';
import { VEHICLE_CATEGORY_CODES, VEHICLE_DOMAIN } from './vehicle.constants';

export function isVehicleCategoryCode(code: ListingCategoryCode): boolean {
  return (VEHICLE_CATEGORY_CODES as readonly ListingCategoryCode[]).includes(code);
}

export function isVehicleDomain(domain: string): boolean {
  return domain === VEHICLE_DOMAIN;
}

export function canManageVehicle(input: {
  actorId: string;
  actorRole: UserRole;
  sellerId: string | null | undefined;
}): boolean {
  return canManageListing(input);
}

export function canModerateVehicles(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return canModerateListings(role, permissions);
}

export function assertVehicleCategoryCode(code: ListingCategoryCode): void {
  if (!isVehicleCategoryCode(code)) {
    throw new Error(`Category ${code} is not a vehicle category`);
  }
}
