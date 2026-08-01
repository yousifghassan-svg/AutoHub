import type { LegacySellDraftV1 } from '@/features/sell/core/types';
import {
  DEFAULT_VEHICLE_DOMAIN_DATA,
  asVehicleDomainData,
  type VehicleSellDomainData,
} from './domain-data';

export function createInitialVehicleDomainData(): Record<string, unknown> {
  return { ...DEFAULT_VEHICLE_DOMAIN_DATA };
}

export function mapVehicleDraftToDomain(
  raw: unknown,
  legacy?: LegacySellDraftV1,
): Record<string, unknown> {
  if (legacy?.form) {
    return {
      year: legacy.form.year ?? DEFAULT_VEHICLE_DOMAIN_DATA.year,
      mileageKm: legacy.form.mileageKm ?? '',
      brandId: legacy.form.brandId ?? '',
      modelId: legacy.form.modelId ?? '',
    } satisfies VehicleSellDomainData;
  }

  if (raw && typeof raw === 'object') {
    return asVehicleDomainData(raw as Record<string, unknown>);
  }

  return createInitialVehicleDomainData();
}

export function serializeVehicleDomainData(
  domainData: Record<string, unknown>,
): VehicleSellDomainData {
  return asVehicleDomainData(domainData);
}
