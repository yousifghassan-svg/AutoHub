import type { SellSubmitArgs, SellSubmitResult } from '@/features/sell/core/types';
import { withNegotiableDescription } from '@/features/sell/lib/listing-description';
import { asVehicleDomainData } from './domain-data';

/**
 * Build POST/PATCH /v1/vehicles body.
 * API VehicleDetailsDto uses `makeId` (mapped server-side to brandId).
 */
export function buildCreateVehicleBody(state: SellSubmitArgs['state']) {
  const data = asVehicleDomainData(state.domainData);
  return {
    categoryId: state.categoryId,
    cityId: state.cityId,
    title: state.title.trim(),
    description: withNegotiableDescription(
      state.description,
      state.negotiable,
    ),
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
  updateVehicle: (
    id: string,
    body: Record<string, unknown>,
  ) => Promise<{ id: string }>;
  changeStatus: (input: {
    id: string;
    status: 'PENDING' | 'DRAFT';
  }) => Promise<unknown>;
};

export async function submitVehicleListing(
  deps: VehicleSubmitDeps,
  args: SellSubmitArgs,
): Promise<SellSubmitResult> {
  const body = buildCreateVehicleBody(args.state);

  let listingId: string;
  if (args.mode === 'edit') {
    if (!args.listingId) {
      throw new Error('Edit mode requires listingId');
    }
    listingId = (await deps.updateVehicle(args.listingId, body)).id;
  } else if (args.listingId) {
    listingId = (await deps.updateVehicle(args.listingId, body)).id;
  } else {
    listingId = (await deps.createVehicle(body)).id;
  }

  await args.attachMedia(listingId);

  // Host gates submitForReview; never call status on plain save.
  if (args.submitForReview) {
    await deps.changeStatus({ id: listingId, status: 'PENDING' });
  }
  return { listingId };
}
