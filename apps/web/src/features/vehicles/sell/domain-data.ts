export type VehicleSellDomainData = {
  year: string;
  mileageKm: string;
  brandId: string;
  modelId: string;
};

export const DEFAULT_VEHICLE_DOMAIN_DATA: VehicleSellDomainData = {
  year: String(new Date().getFullYear()),
  mileageKm: '',
  brandId: '',
  modelId: '',
};

export function asVehicleDomainData(
  raw: Record<string, unknown>,
): VehicleSellDomainData {
  return {
    year:
      typeof raw.year === 'string'
        ? raw.year
        : DEFAULT_VEHICLE_DOMAIN_DATA.year,
    mileageKm: typeof raw.mileageKm === 'string' ? raw.mileageKm : '',
    brandId: typeof raw.brandId === 'string' ? raw.brandId : '',
    modelId: typeof raw.modelId === 'string' ? raw.modelId : '',
  };
}
