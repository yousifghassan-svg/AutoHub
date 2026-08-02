import type { SellSubmitArgs, SellSubmitResult } from '@/features/sell/core/types';
import { asVehicleDomainData } from './domain-data';
import {
  buildPatchBody,
  buildSparseCreateBody,
  parseCompletenessErrors,
} from './server-sync';

export function buildCreateVehicleBody(state: SellSubmitArgs['state']) {
  return buildSparseCreateBody(state);
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
  let listingId = args.state.listingId;
  try {
    if (listingId) {
      await deps.updateVehicle(
        listingId,
        buildPatchBody(args.state, 'publish'),
      );
    } else {
      const created = await deps.createVehicle(buildCreateVehicleBody(args.state));
      listingId = created.id;
    }

    await args.attachMedia(listingId);

    if (args.submitForReview) {
      await deps.changeStatus({ id: listingId, status: 'PENDING' });
    }
    return { listingId };
  } catch (error) {
    const parsed = parseCompletenessErrors(error);
    throw Object.assign(new Error(parsed.message), {
      step: parsed.step,
      cause: error,
    });
  }
}

/** Kept for callers that still expect the old shape. */
export function buildLegacyCreateBody(state: SellSubmitArgs['state']) {
  const data = asVehicleDomainData(state.domainData);
  return {
    categoryId: state.categoryId,
    cityId: state.cityId,
    title: state.title.trim(),
    description: state.description.trim(),
    primaryPrice: Number(state.primaryPrice),
    currencyCode: state.currencyCode || 'IQD',
    language: 'ar',
    features: data.features,
    vehicleDetails: {
      year: Number(data.year) || undefined,
      mileageKm: data.mileageKm ? Number(data.mileageKm) : undefined,
      brandId: data.brandId || undefined,
      modelId: data.modelId || undefined,
      fuelTypeId: data.fuelTypeId || undefined,
      transmissionTypeId: data.transmissionTypeId || undefined,
      driveTypeId: data.driveTypeId || undefined,
      bodyTypeId: data.bodyTypeId || undefined,
      colorId: data.colorId || undefined,
      engineTypeId: data.engineTypeId || undefined,
      engineSizeCc: data.engineSizeCc ? Number(data.engineSizeCc) : undefined,
      vin: data.vin.trim() || undefined,
    },
  };
}
