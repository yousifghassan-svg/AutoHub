import {
  createCommonListingQualityRules,
  domainStringRule,
  type ListingQualityRule,
} from '@autohub/utils';
import { vehicleDetailsRequireCatalogSpecs } from './domain-data';

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Vehicle listing quality rules.
 * Common listing rules + vehicle domain contributions only.
 */
export function createVehicleListingQualityRules(
  categoryCode: string,
): ListingQualityRule[] {
  const requireCatalogSpecs = vehicleDetailsRequireCatalogSpecs(categoryCode);

  const domainRules: ListingQualityRule[] = [
    {
      id: 'vehicle.year',
      severity: 'required',
      label: 'Year entered',
      recommendation: 'Add the vehicle year.',
      weight: 10,
      evaluate: (ctx) => {
        const year = Number(ctx.domainData.year);
        return (
          Boolean(str(ctx.domainData.year)) &&
          Number.isFinite(year) &&
          year >= 1950 &&
          year <= new Date().getFullYear() + 1
        );
      },
    },
    domainStringRule({
      id: 'vehicle.brand',
      severity: 'recommended',
      label: 'Make / brand',
      recommendation: 'Add the vehicle make for better search matching.',
      weight: 8,
      field: 'brandId',
    }),
    domainStringRule({
      id: 'vehicle.model',
      severity: 'recommended',
      label: 'Model',
      recommendation: 'Add the vehicle model.',
      weight: 8,
      field: 'modelId',
    }),
    domainStringRule({
      id: 'vehicle.color',
      severity: 'recommended',
      label: 'Color',
      recommendation: 'Add vehicle color.',
      weight: 5,
      field: 'colorId',
    }),
    domainStringRule({
      id: 'vehicle.vin',
      severity: 'premium',
      label: 'VIN',
      recommendation: 'Add VIN for buyer trust.',
      weight: 5,
      field: 'vin',
    }),
  ];

  if (requireCatalogSpecs) {
    domainRules.push(
      domainStringRule({
        id: 'vehicle.fuel',
        severity: 'required',
        label: 'Fuel type',
        recommendation: 'Select fuel type.',
        weight: 6,
        field: 'fuelTypeId',
      }),
      domainStringRule({
        id: 'vehicle.transmission',
        severity: 'required',
        label: 'Transmission',
        recommendation: 'Select transmission.',
        weight: 6,
        field: 'transmissionTypeId',
      }),
      {
        id: 'vehicle.mileage',
        severity: 'required',
        label: 'Mileage',
        recommendation: 'Enter mileage (km).',
        weight: 6,
        evaluate: (ctx) => {
          const raw = str(ctx.domainData.mileageKm);
          const n = Number(raw);
          return Boolean(raw) && Number.isFinite(n) && n >= 0;
        },
      },
    );
  } else {
    domainRules.push(
      domainStringRule({
        id: 'vehicle.fuel',
        severity: 'recommended',
        label: 'Fuel type',
        recommendation: 'Select fuel type when known.',
        weight: 4,
        field: 'fuelTypeId',
      }),
      domainStringRule({
        id: 'vehicle.transmission',
        severity: 'recommended',
        label: 'Transmission',
        recommendation: 'Select transmission when known.',
        weight: 4,
        field: 'transmissionTypeId',
      }),
    );
  }

  return [
    ...createCommonListingQualityRules({
      minPhotosRequired: 1,
      minPhotosRecommended: 3,
      minPhotosPremium: 6,
      requireVideoPremium: true,
    }),
    ...domainRules,
  ];
}
