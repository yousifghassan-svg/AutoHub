import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  parseNegotiableDescription,
  withNegotiableDescription,
} from './listing-description';
import {
  cityBelongsToGovernorate,
  hasListingMapPin,
  isCompleteListingLocation,
} from './listing-location';
import {
  isSellCurrencyCode,
  isValidListingSalePrice,
  parseListingPrice,
} from './listing-price';

describe('listing price (P5-3)', () => {
  it('accepts positive finite prices', () => {
    assert.equal(isValidListingSalePrice('100'), true);
    assert.equal(isValidListingSalePrice('0.5'), true);
    assert.equal(isValidListingSalePrice('0'), false);
    assert.equal(isValidListingSalePrice(''), false);
    assert.equal(isValidListingSalePrice('abc'), false);
    assert.equal(parseListingPrice('12.5'), 12.5);
  });

  it('allows IQD and USD only for sell', () => {
    assert.equal(isSellCurrencyCode('IQD'), true);
    assert.equal(isSellCurrencyCode('USD'), true);
    assert.equal(isSellCurrencyCode('EUR'), false);
  });
});

describe('listing location (P5-3)', () => {
  it('requires city in selected governorate', () => {
    const city = { id: 'c1', governorateId: 'g1' };
    assert.equal(cityBelongsToGovernorate(city, 'g1'), true);
    assert.equal(cityBelongsToGovernorate(city, 'g2'), false);
    assert.equal(
      isCompleteListingLocation(
        { governorateId: 'g1', cityId: 'c1' },
        city,
      ),
      true,
    );
    assert.equal(
      isCompleteListingLocation(
        { governorateId: '', cityId: 'c1' },
        city,
      ),
      false,
    );
  });

  it('detects future map pin coordinates', () => {
    assert.equal(
      hasListingMapPin({
        governorateId: 'g',
        cityId: 'c',
        locationLat: '33.3',
        locationLng: '44.4',
      }),
      true,
    );
    assert.equal(
      hasListingMapPin({
        governorateId: 'g',
        cityId: 'c',
        locationLat: '33.3',
        locationLng: '',
      }),
      false,
    );
  });
});

describe('listing description negotiable (P5-3 / P5-9)', () => {
  it('appends negotiable note once', () => {
    assert.equal(
      withNegotiableDescription('Nice car', true),
      'Nice car\n\nPrice is negotiable.',
    );
    assert.equal(
      withNegotiableDescription('Nice car\n\nPrice is negotiable.', true),
      'Nice car\n\nPrice is negotiable.',
    );
    assert.equal(withNegotiableDescription('Nice car', false), 'Nice car');
  });

  it('parses negotiable note for edit hydrate', () => {
    assert.deepEqual(
      parseNegotiableDescription('Nice car\n\nPrice is negotiable.'),
      { description: 'Nice car', negotiable: true },
    );
    assert.deepEqual(parseNegotiableDescription('Plain'), {
      description: 'Plain',
      negotiable: false,
    });
  });
});
