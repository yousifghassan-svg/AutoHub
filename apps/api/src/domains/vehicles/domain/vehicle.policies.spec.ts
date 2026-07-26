import { ListingCategoryCode } from '@autohub/database';
import {
  assertVehicleCategoryCode,
  canManageVehicle,
  isVehicleCategoryCode,
  isVehicleDomain,
} from './vehicle.policies';
import { VEHICLE_DOMAIN } from './vehicle.constants';

describe('vehicle.policies', () => {
  it('recognizes vehicle category codes', () => {
    expect(isVehicleCategoryCode(ListingCategoryCode.CAR)).toBe(true);
    expect(isVehicleCategoryCode(ListingCategoryCode.MOTORCYCLE)).toBe(true);
    expect(isVehicleCategoryCode(ListingCategoryCode.PLATE)).toBe(false);
  });

  it('recognizes vehicle domain', () => {
    expect(isVehicleDomain(VEHICLE_DOMAIN)).toBe(true);
    expect(isVehicleDomain('PLATE')).toBe(false);
  });

  it('allows owner to manage vehicle', () => {
    expect(
      canManageVehicle({
        actorId: 'user-1',
        actorRole: 'USER',
        sellerId: 'user-1',
      }),
    ).toBe(true);
  });

  it('rejects non-owner manage', () => {
    expect(
      canManageVehicle({
        actorId: 'user-1',
        actorRole: 'USER',
        sellerId: 'user-2',
      }),
    ).toBe(false);
  });

  it('assertVehicleCategoryCode throws for PLATE', () => {
    expect(() => assertVehicleCategoryCode(ListingCategoryCode.PLATE)).toThrow(
      'not a vehicle category',
    );
  });
});
