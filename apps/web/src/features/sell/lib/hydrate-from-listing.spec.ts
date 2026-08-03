import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ComponentType } from 'react';
import type { ListingDetailModel } from '@/features/listings/domain/types';
import type { SellDomainPlugin, SellStepProps } from '../core/types';
import { hydrateSellStateFromListing } from './hydrate-from-listing';

const StubPreview: ComponentType<SellStepProps> = () => null;

function vehiclePlugin(): SellDomainPlugin {
  return {
    id: 'VEHICLE',
    categoryCodes: ['CAR'],
    workflowId: 'vehicle-listing',
    steps: {},
    Preview: StubPreview,
    validators: {},
    createInitialDomainData: () => ({ year: '', brandId: '' }),
    mapDraftToDomain: (raw) =>
      raw && typeof raw === 'object'
        ? { ...(raw as Record<string, unknown>) }
        : { year: '', brandId: '' },
    serializeDomainData: (d) => d,
    getQualityRules: () => [],
    canSubmit: () => true,
    submit: async () => ({ listingId: 'L1' }),
  };
}

function sampleListing(
  overrides: Partial<ListingDetailModel> = {},
): ListingDetailModel {
  return {
    id: 'listing-1',
    slug: 'camry',
    title: '2020 Camry',
    price: 15_000_000,
    currencyCode: 'IQD',
    location: 'Baghdad',
    mileageKm: 40_000,
    year: 2020,
    isVerified: false,
    isFeatured: false,
    thumbnailKey: null,
    imageUrl: null,
    imageUrls: [],
    categoryCode: 'CAR',
    domain: 'VEHICLE',
    status: 'ACTIVE',
    description: 'Clean car\n\nPrice is negotiable.',
    media: [
      {
        id: 'lm-1',
        mediaAssetId: 'asset-1',
        url: 'https://cdn.example/1.jpg',
        kind: 'IMAGE',
        isPrimary: true,
      },
      {
        id: 'lm-2',
        mediaAssetId: 'asset-2',
        url: 'https://cdn.example/2.jpg',
        kind: 'IMAGE',
        isPrimary: false,
      },
      {
        id: 'lm-legacy',
        mediaAssetId: null,
        url: 'https://cdn.example/legacy.jpg',
        kind: 'IMAGE',
      },
    ],
    publishedAt: null,
    sellerId: 'seller-1',
    specs: {
      brandId: 'brand-toyota',
      modelId: 'model-camry',
      fuelTypeId: 'fuel-1',
      transmissionTypeId: 'trans-1',
      bodyTypeId: 'body-1',
      driveTypeId: 'drive-1',
      colorId: 'color-1',
    },
    cityId: 'city-1',
    governorateId: 'gov-1',
    cityNameEn: 'Baghdad',
    latitude: 33.3,
    longitude: 44.4,
    locationText: 'Baghdad',
    features: [],
    sellerContact: null,
    ...overrides,
  };
}

describe('hydrateSellStateFromListing (P5-9)', () => {
  it('maps vehicle fields, negotiable note, and mediaAssetId links', () => {
    const { state, mediaMeta } = hydrateSellStateFromListing(
      sampleListing(),
      vehiclePlugin(),
    );

    assert.equal(state.title, '2020 Camry');
    assert.equal(state.primaryPrice, '15000000');
    assert.equal(state.cityId, 'city-1');
    assert.equal(state.governorateId, 'gov-1');
    assert.equal(state.negotiable, true);
    assert.equal(state.description, 'Clean car');
    assert.equal(state.domainData.brandId, 'brand-toyota');
    assert.equal(state.domainData.year, '2020');
    assert.deepEqual(state.imageAssetIds, ['asset-1', 'asset-2']);
    assert.deepEqual(mediaMeta.syncedMediaAssetIds, ['asset-1', 'asset-2']);
    assert.deepEqual(mediaMeta.listingMediaByAssetId, {
      'asset-1': 'lm-1',
      'asset-2': 'lm-2',
    });
  });

  it('skips media rows without mediaAssetId', () => {
    const { state } = hydrateSellStateFromListing(
      sampleListing({
        media: [
          {
            id: 'lm-x',
            mediaAssetId: null,
            url: null,
            kind: 'IMAGE',
          },
        ],
      }),
      vehiclePlugin(),
    );
    assert.deepEqual(state.imageAssetIds, []);
  });
});
