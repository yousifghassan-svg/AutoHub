import type { ListingDraftMeta } from '@autohub/utils';
import type { ListingDetailModel } from '@/features/listings/domain/types';
import { isPlateListing } from '@/features/listings/domain/marketplace-path';
import { licensePlateFromListing } from '@/features/plates/lib/from-listing';
import {
  DEFAULT_COMMON_STATE,
  type SellDomainPlugin,
  type SellWizardState,
} from '../core/types';
import { parseNegotiableDescription } from './listing-description';

export type ListingMediaAssetMap = Record<string, string>;

/**
 * Map a listing detail into Sell Wizard state + media link meta.
 * Only media rows with mediaAssetId are editable via MediaUploader.
 */
export function hydrateSellStateFromListing(
  listing: ListingDetailModel,
  plugin: SellDomainPlugin,
): {
  state: SellWizardState;
  mediaMeta: ListingDraftMeta;
} {
  const { description, negotiable } = parseNegotiableDescription(
    listing.description ?? '',
  );

  const media = [...(listing.media ?? [])];
  const imageAssetIds: string[] = [];
  const videoAssetIds: string[] = [];
  const listingMediaByAssetId: ListingMediaAssetMap = {};

  for (const item of media) {
    const assetId = item.mediaAssetId?.trim();
    if (!assetId) continue;
    listingMediaByAssetId[assetId] = item.id;
    const kind = (item.kind ?? 'IMAGE').toUpperCase();
    if (kind === 'VIDEO') {
      videoAssetIds.push(assetId);
    } else {
      imageAssetIds.push(assetId);
    }
  }

  const common = {
    ...DEFAULT_COMMON_STATE,
    categoryCode: listing.categoryCode || DEFAULT_COMMON_STATE.categoryCode,
    categoryId: '',
    governorateId: listing.governorateId ?? '',
    cityId: listing.cityId ?? '',
    locationLat:
      listing.latitude != null && Number.isFinite(listing.latitude)
        ? String(listing.latitude)
        : '',
    locationLng:
      listing.longitude != null && Number.isFinite(listing.longitude)
        ? String(listing.longitude)
        : '',
    title: listing.title ?? '',
    description,
    primaryPrice:
      listing.price != null && Number.isFinite(listing.price)
        ? String(listing.price)
        : '',
    currencyCode: listing.currencyCode || 'IQD',
    negotiable,
    imageAssetIds,
    videoAssetIds,
  };

  const domainData = isPlateListing(listing)
    ? plugin.mapDraftToDomain({
        plate: licensePlateFromListing(listing.plateDetails) ?? undefined,
      })
    : plugin.mapDraftToDomain({
        year:
          listing.year != null ? String(listing.year) : undefined,
        mileageKm:
          listing.mileageKm != null ? String(listing.mileageKm) : undefined,
        brandId: listing.specs?.brandId ?? '',
        modelId: listing.specs?.modelId ?? '',
        fuelTypeId: listing.specs?.fuelTypeId ?? '',
        transmissionTypeId: listing.specs?.transmissionTypeId ?? '',
        bodyTypeId: listing.specs?.bodyTypeId ?? '',
        driveTypeId: listing.specs?.driveTypeId ?? '',
        colorId: listing.specs?.colorId ?? '',
        vin: '',
      });

  const synced = [...imageAssetIds, ...videoAssetIds];

  return {
    state: { ...common, domainData },
    mediaMeta: {
      syncedMediaAssetIds: synced,
      listingMediaByAssetId,
    },
  };
}

export function listingMediaMapFromMeta(
  meta: ListingDraftMeta | undefined,
): ListingMediaAssetMap {
  const raw = meta?.listingMediaByAssetId;
  if (!raw || typeof raw !== 'object') return {};
  const out: ListingMediaAssetMap = {};
  for (const [assetId, listingMediaId] of Object.entries(
    raw as Record<string, unknown>,
  )) {
    if (typeof listingMediaId === 'string' && listingMediaId) {
      out[assetId] = listingMediaId;
    }
  }
  return out;
}

export function withListingMediaMap(
  meta: ListingDraftMeta,
  map: ListingMediaAssetMap,
): ListingDraftMeta {
  return { ...meta, listingMediaByAssetId: map };
}
