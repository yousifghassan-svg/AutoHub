import type { SellStepValidator } from '@/features/sell/core/types';
import {
  asVehicleDomainData,
  vehicleDetailsRequireCatalogSpecs,
} from '../domain-data';

export const validateVehicleDetailsStep: SellStepValidator = (state) => {
  const data = asVehicleDomainData(state.domainData);
  const year = Number(data.year);
  const yearOk =
    Boolean(data.year) &&
    Number.isFinite(year) &&
    year >= 1950 &&
    year <= new Date().getFullYear() + 1;

  const baseOk =
    state.title.trim().length >= 3 &&
    yearOk &&
    state.description.trim().length >= 10;

  if (!baseOk) return false;

  if (!vehicleDetailsRequireCatalogSpecs(state.categoryCode)) {
    return true;
  }

  const mileage = Number(data.mileageKm);
  const mileageOk =
    Boolean(data.mileageKm.trim()) &&
    Number.isFinite(mileage) &&
    mileage >= 0;

  return Boolean(
    data.fuelTypeId && data.transmissionTypeId && mileageOk,
  );
};
