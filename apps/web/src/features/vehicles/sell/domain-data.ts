export type VehicleSellDomainData = {
  year: string;
  mileageKm: string;
  brandId: string;
  modelId: string;
  fuelTypeId: string;
  transmissionTypeId: string;
  driveTypeId: string;
  bodyTypeId: string;
  colorId: string;
  engineTypeId: string;
  engineSizeCc: string;
  vin: string;
  features: string[];
};

export const DEFAULT_VEHICLE_DOMAIN_DATA: VehicleSellDomainData = {
  year: String(new Date().getFullYear()),
  mileageKm: '',
  brandId: '',
  modelId: '',
  fuelTypeId: '',
  transmissionTypeId: '',
  driveTypeId: '',
  bodyTypeId: '',
  colorId: '',
  engineTypeId: '',
  engineSizeCc: '',
  vin: '',
  features: [],
};

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function asVehicleDomainData(
  raw: Record<string, unknown>,
): VehicleSellDomainData {
  const features = Array.isArray(raw.features)
    ? raw.features.filter((f): f is string => typeof f === 'string')
    : [];
  return {
    year: asString(raw.year, DEFAULT_VEHICLE_DOMAIN_DATA.year),
    mileageKm: asString(raw.mileageKm),
    brandId: asString(raw.brandId),
    modelId: asString(raw.modelId),
    fuelTypeId: asString(raw.fuelTypeId),
    transmissionTypeId: asString(raw.transmissionTypeId),
    driveTypeId: asString(raw.driveTypeId),
    bodyTypeId: asString(raw.bodyTypeId),
    colorId: asString(raw.colorId),
    engineTypeId: asString(raw.engineTypeId),
    engineSizeCc: asString(raw.engineSizeCc),
    vin: asString(raw.vin),
    features,
  };
}
