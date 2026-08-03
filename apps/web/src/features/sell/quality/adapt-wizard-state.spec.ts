import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DEFAULT_COMMON_STATE } from '../core/types';
import { createVehicleListingQualityRules } from '@/features/vehicles/sell/quality-rules';
import { createPlateListingQualityRules } from '@/features/plates/sell/quality-rules';
import { evaluateWizardListingQuality } from './adapt-wizard-state';

describe('wizard listing quality (P5-6)', () => {
  it('vehicle cannot publish without photo and price', () => {
    const result = evaluateWizardListingQuality(
      {
        ...DEFAULT_COMMON_STATE,
        categoryCode: 'CAR',
        categoryId: 'cat',
        governorateId: 'g',
        cityId: 'c',
        title: 'Camry',
        description: 'Nice car here',
        primaryPrice: '',
        imageAssetIds: [],
        domainData: {
          year: '2020',
          mileageKm: '1000',
          fuelTypeId: 'f',
          transmissionTypeId: 't',
          brandId: '',
          modelId: '',
          bodyTypeId: '',
          driveTypeId: '',
          colorId: '',
          vin: '',
        },
      },
      createVehicleListingQualityRules('CAR'),
    );
    assert.equal(result.canPublish, false);
    assert.ok(result.missingRequired.some((i) => i.id === 'listing.price'));
    assert.ok(
      result.missingRequired.some((i) => i.id === 'listing.photos_required'),
    );
  });

  it('vehicle recommended tips include color and more photos', () => {
    const result = evaluateWizardListingQuality(
      {
        ...DEFAULT_COMMON_STATE,
        categoryCode: 'CAR',
        categoryId: 'cat',
        governorateId: 'g',
        cityId: 'c',
        title: 'Camry',
        description: 'Nice car here with enough text',
        primaryPrice: '100',
        currencyCode: 'IQD',
        imageAssetIds: ['a'],
        domainData: {
          year: '2020',
          mileageKm: '1000',
          fuelTypeId: 'f',
          transmissionTypeId: 't',
          brandId: 'b',
          modelId: 'm',
          bodyTypeId: '',
          driveTypeId: '',
          colorId: '',
          vin: '',
        },
      },
      createVehicleListingQualityRules('CAR'),
    );
    assert.equal(result.canPublish, true);
    assert.ok(result.recommendations.some((t) => /color/i.test(t)));
    assert.ok(result.recommendations.some((t) => /photo/i.test(t)));
  });

  it('plate does not require photos or title', () => {
    const result = evaluateWizardListingQuality(
      {
        ...DEFAULT_COMMON_STATE,
        categoryCode: 'PLATE',
        categoryId: 'cat',
        governorateId: 'g',
        cityId: 'c',
        title: '',
        description: 'Private plate for sale',
        primaryPrice: '500',
        currencyCode: 'IQD',
        imageAssetIds: [],
        domainData: {
          plate: { code: '11', letter: 'A', number: '1234', governorate: 'BAGHDAD' },
        },
      },
      createPlateListingQualityRules(),
    );
    assert.equal(result.canPublish, true);
    assert.ok(result.missingRecommended.some((i) => i.id === 'listing.title'));
  });
});
