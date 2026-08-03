export type VehicleSellDomainData = {
  year: string;
  mileageKm: string;
  brandId: string;
  modelId: string;
  fuelTypeId: string;
  transmissionTypeId: string;
  bodyTypeId: string;
  driveTypeId: string;
  colorId: string;
};

export const DEFAULT_VEHICLE_DOMAIN_DATA: VehicleSellDomainData = {
  year: String(new Date().getFullYear()),
  mileageKm: '',
  brandId: '',
  modelId: '',
  fuelTypeId: '',
  transmissionTypeId: '',
  bodyTypeId: '',
  driveTypeId: '',
  colorId: '',
};

function str(raw: Record<string, unknown>, key: keyof VehicleSellDomainData): string {
  const v = raw[key];
  return typeof v === 'string' ? v : '';
}

export function asVehicleDomainData(
  raw: Record<string, unknown>,
): VehicleSellDomainData {
  return {
    year: str(raw, 'year') || DEFAULT_VEHICLE_DOMAIN_DATA.year,
    mileageKm: str(raw, 'mileageKm'),
    brandId: str(raw, 'brandId'),
    modelId: str(raw, 'modelId'),
    fuelTypeId: str(raw, 'fuelTypeId'),
    transmissionTypeId: str(raw, 'transmissionTypeId'),
    bodyTypeId: str(raw, 'bodyTypeId'),
    driveTypeId: str(raw, 'driveTypeId'),
    colorId: str(raw, 'colorId'),
  };
}

/** Categories that use catalog fuel/transmission/mileage like mobile create. */
export function vehicleDetailsRequireCatalogSpecs(
  categoryCode: string | undefined | null,
): boolean {
  return (
    categoryCode === 'CAR' ||
    categoryCode === 'MOTORCYCLE' ||
    categoryCode === 'TRUCK'
  );
}
