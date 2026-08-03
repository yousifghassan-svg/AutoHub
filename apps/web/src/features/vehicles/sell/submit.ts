import type { SellSubmitArgs, SellSubmitResult } from '@/features/sell/core/types';
import { asVehicleDomainData } from './domain-data';

/**
 * Build POST /v1/vehicles body.
 * API VehicleDetailsDto uses `makeId` (mapped server-side to brandId).
 */
export function buildCreateVehicleBody(state: SellSubmitArgs['state']) {
  const data = asVehicleDomainData(state.domainData);
  return {
    categoryId: state.categoryId,
    cityId: state.cityId,
    title: state.title.trim(),
    description: state.description.trim(),
    primaryPrice: Number(state.primaryPrice),
    currencyCode: state.currencyCode || 'IQD',
    language: 'ar',
    vehicleDetails: {
      year: Number(data.year) || undefined,
      mileageKm: data.mileageKm ? Number(data.mileageKm) : undefined,
      makeId: data.brandId || undefined,
      modelId: data.modelId || undefined,
      fuelTypeId: data.fuelTypeId || undefined,
      transmissionTypeId: data.transmissionTypeId || undefined,
      bodyTypeId: data.bodyTypeId || undefined,
      driveTypeId: data.driveTypeId || undefined,
      colorId: data.colorId || undefined,
    },
  };
}

export type VehicleSubmitDeps = {
  createVehicle: (body: Record<string, unknown>) => Promise<{ id: string }>;
  changeStatus: (input: {
    id: string;
    status: 'PENDING' | 'DRAFT';
  }) => Promise<unknown>;
};

export async function submitVehicleListing(
  deps: VehicleSubmitDeps,
  args: SellSubmitArgs,
): Promise<SellSubmitResult> {
  const created = await deps.createVehicle(buildCreateVehicleBody(args.state));
  if (
    args.state.imageAssetIds.length ||
    args.state.videoAssetIds.length
  ) {
    await args.attachMedia(created.id);
  }
  if (args.submitForReview) {
    await deps.changeStatus({ id: created.id, status: 'PENDING' });
  }
  return { listingId: created.id };
}
