import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createCommonListingQualityRules,
  domainStringRule,
  evaluateListingQuality,
  type ListingQualityContext,
} from './index';

function baseCtx(
  patch?: Partial<ListingQualityContext['common']>,
  domainData: Record<string, unknown> = {},
): ListingQualityContext {
  return {
    common: {
      categoryCode: 'CAR',
      categoryId: 'cat-1',
      governorateId: 'g1',
      cityId: 'c1',
      title: '2020 Camry',
      description: 'Clean car in Baghdad with service history.',
      primaryPrice: '15000000',
      currencyCode: 'IQD',
      imageAssetIds: ['img1'],
      videoAssetIds: [],
      ...patch,
    },
    domainData,
  };
}

describe('listing quality engine (P5-6)', () => {
  const common = createCommonListingQualityRules({ minPhotosRequired: 1 });

  it('blocks publish when required items missing', () => {
    const result = evaluateListingQuality(
      baseCtx({ primaryPrice: '', imageAssetIds: [] }),
      common,
    );
    assert.equal(result.canPublish, false);
    assert.ok(result.missingRequired.some((i) => i.id === 'listing.price'));
    assert.ok(
      result.missingRequired.some((i) => i.id === 'listing.photos_required'),
    );
    assert.ok(result.score <= 45);
    assert.equal(result.grade, 'needs_work');
  });

  it('allows publish when required complete even if premium missing', () => {
    const result = evaluateListingQuality(baseCtx(), common);
    assert.equal(result.canPublish, true);
    assert.ok(result.missingRecommended.length >= 1);
    assert.ok(result.missingPremium.some((i) => i.id === 'listing.video'));
    assert.ok(result.recommendations.some((t) => /photo|video|description/i.test(t)));
  });

  it('raises score when recommended and premium items filled', () => {
    const weak = evaluateListingQuality(baseCtx(), common);
    const strong = evaluateListingQuality(
      baseCtx({
        description:
          'Very detailed description covering condition, service history, ownership, and options for the buyer.',
        imageAssetIds: ['1', '2', '3', '4', '5', '6'],
        videoAssetIds: ['v1'],
      }),
      common,
    );
    assert.ok(strong.score > weak.score);
    assert.equal(strong.canPublish, true);
    assert.ok(['good', 'excellent'].includes(strong.grade));
  });

  it('accepts plugin domain rules without engine knowing field meaning', () => {
    const rules = [
      ...common,
      domainStringRule({
        id: 'vehicle.vin',
        severity: 'premium',
        label: 'VIN',
        recommendation: 'Add VIN.',
        weight: 5,
        field: 'vin',
      }),
    ];
    const without = evaluateListingQuality(baseCtx(), rules);
    const withVin = evaluateListingQuality(baseCtx({}, { vin: 'ABC123' }), rules);
    assert.ok(withVin.score >= without.score);
    assert.ok(without.missingPremium.some((i) => i.id === 'vehicle.vin'));
  });

  it('plate path can omit required photos and treat title as recommended', () => {
    const plateRules = createCommonListingQualityRules({
      minPhotosRequired: 0,
      requireTitle: false,
    });
    const result = evaluateListingQuality(
      baseCtx({
        categoryCode: 'PLATE',
        title: '',
        imageAssetIds: [],
      }),
      plateRules,
    );
    assert.equal(result.canPublish, true);
    assert.ok(result.missingRecommended.some((i) => i.id === 'listing.title'));
    assert.equal(
      result.missingRequired.some((i) => i.id === 'listing.photos_required'),
      false,
    );
  });
});

