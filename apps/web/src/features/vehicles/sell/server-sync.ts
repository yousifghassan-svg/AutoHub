import type { ListingDetailModel } from '@/features/listings/domain/types';
import type { SellStepId, SellWizardState } from '@/features/sell/core/types';
import { DEFAULT_COMMON_STATE } from '@/features/sell/core/types';
import { asVehicleDomainData } from './domain-data';

export function buildSparseCreateBody(state: SellWizardState) {
  const data = asVehicleDomainData(state.domainData);
  const body: Record<string, unknown> = {
    categoryId: state.categoryId,
    cityId: state.cityId,
    draftStep: 'category',
    currencyCode: state.currencyCode || 'IQD',
    language: 'ar',
  };
  if (state.title.trim().length >= 3) body.title = state.title.trim();
  if (state.description.trim().length >= 10) {
    body.description = state.description.trim();
  }
  if (state.primaryPrice && Number(state.primaryPrice) >= 0) {
    body.primaryPrice = Number(state.primaryPrice);
  }
  const vehicleDetails = buildVehicleDetailsPayload(data);
  if (Object.keys(vehicleDetails).length) {
    body.vehicleDetails = vehicleDetails;
  }
  if (data.features.length) body.features = data.features;
  return body;
}

export function buildPatchBody(state: SellWizardState, draftStep: SellStepId) {
  const data = asVehicleDomainData(state.domainData);
  const body: Record<string, unknown> = {
    draftStep,
    currencyCode: state.currencyCode || 'IQD',
  };
  if (state.cityId) body.cityId = state.cityId;
  body.title = state.title.trim();
  body.description = state.description.trim();
  if (state.primaryPrice !== '') {
    const price = Number(state.primaryPrice);
    if (!Number.isNaN(price)) body.primaryPrice = price;
  }
  const vehicleDetails = buildVehicleDetailsPayload(data);
  if (Object.keys(vehicleDetails).length) {
    body.vehicleDetails = vehicleDetails;
  }
  body.features = data.features;
  return body;
}

function buildVehicleDetailsPayload(data: ReturnType<typeof asVehicleDomainData>) {
  const out: Record<string, unknown> = {};
  if (data.year) out.year = Number(data.year);
  if (data.mileageKm) out.mileageKm = Number(data.mileageKm);
  if (data.brandId) out.brandId = data.brandId;
  if (data.modelId) out.modelId = data.modelId;
  if (data.fuelTypeId) out.fuelTypeId = data.fuelTypeId;
  if (data.transmissionTypeId) out.transmissionTypeId = data.transmissionTypeId;
  if (data.driveTypeId) out.driveTypeId = data.driveTypeId;
  if (data.bodyTypeId) out.bodyTypeId = data.bodyTypeId;
  if (data.colorId) out.colorId = data.colorId;
  if (data.engineTypeId) out.engineTypeId = data.engineTypeId;
  if (data.engineSizeCc) out.engineSizeCc = Number(data.engineSizeCc);
  if (data.vin.trim()) out.vin = data.vin.trim().toUpperCase();
  return out;
}

export function hydrateStateFromVehicle(
  listing: ListingDetailModel,
  fallback: SellWizardState,
): { state: SellWizardState; stepId: SellStepId } {
  const specs = listing.specs;
  const imageIds = listing.media
    .filter((m) => m.kind === 'IMAGE' || !m.kind)
    .map((m) => m.mediaAssetId)
    .filter((id): id is string => Boolean(id));
  const videoIds = listing.media
    .filter((m) => m.kind === 'VIDEO')
    .map((m) => m.mediaAssetId)
    .filter((id): id is string => Boolean(id));

  const domainData = asVehicleDomainData({
    year: listing.year != null ? String(listing.year) : fallback.domainData.year,
    mileageKm: listing.mileageKm != null ? String(listing.mileageKm) : '',
    brandId: specs?.brandId ?? '',
    modelId: specs?.modelId ?? '',
    fuelTypeId: specs?.fuelTypeId ?? '',
    transmissionTypeId: specs?.transmissionTypeId ?? '',
    driveTypeId: specs?.driveTypeId ?? '',
    bodyTypeId: specs?.bodyTypeId ?? '',
    colorId: specs?.colorId ?? '',
    engineTypeId: specs?.engineTypeId ?? '',
    engineSizeCc: specs?.engineSizeCc != null ? String(specs.engineSizeCc) : '',
    vin: specs?.vin ?? '',
    features: listing.features ?? [],
  });

  return {
    stepId: (listing.draftStep as SellStepId) || 'vehicleDetails',
    state: {
      ...DEFAULT_COMMON_STATE,
      ...fallback,
      listingId: listing.id,
      categoryCode: listing.categoryCode || fallback.categoryCode || 'CAR',
      categoryId: listing.categoryId ?? fallback.categoryId,
      cityId: listing.cityId ?? fallback.cityId,
      governorateId: listing.governorateId ?? fallback.governorateId,
      title: listing.title === 'Draft' ? '' : listing.title,
      description: listing.description ?? '',
      primaryPrice: listing.price != null ? String(listing.price) : '',
      currencyCode: listing.currencyCode || 'IQD',
      imageAssetIds: imageIds,
      videoAssetIds: videoIds,
      attachedMediaAssetIds: [...imageIds, ...videoIds],
      domainData,
    },
  };
}

export function parseCompletenessErrors(error: unknown): {
  message: string;
  step?: string;
} {
  if (
    error &&
    typeof error === 'object' &&
    'details' in error &&
    error.details &&
    typeof error.details === 'object' &&
    'errors' in (error.details as object)
  ) {
    const errors = (
      error.details as {
        errors: Array<{ message: string; step?: string }>;
      }
    ).errors;
    if (Array.isArray(errors) && errors[0]) {
      return {
        message: errors.map((e) => e.message).join(' · '),
        step: errors[0].step,
      };
    }
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: 'Submit failed' };
}
