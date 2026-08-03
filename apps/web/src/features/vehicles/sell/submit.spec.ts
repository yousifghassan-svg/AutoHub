import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DEFAULT_COMMON_STATE } from '../../sell/core/types';
import { DEFAULT_VEHICLE_DOMAIN_DATA } from './domain-data';
import { buildCreateVehicleBody, submitVehicleListing } from './submit';
import { validateVehicleDetailsStep } from './validators/vehicleDetails';

describe('vehicle sell details (P5-2)', () => {
  it('maps brandId to API makeId and includes catalog specs', () => {
    const body = buildCreateVehicleBody({
      ...DEFAULT_COMMON_STATE,
      categoryCode: 'CAR',
      categoryId: 'cat-car',
      cityId: 'city-1',
      title: '2020 Camry',
      description: 'Clean Camry in Baghdad',
      primaryPrice: '15000000',
      currencyCode: 'IQD',
      domainData: {
        ...DEFAULT_VEHICLE_DOMAIN_DATA,
        year: '2020',
        mileageKm: '45000',
        brandId: 'brand-toyota',
        modelId: 'model-camry',
        fuelTypeId: 'fuel-petrol',
        transmissionTypeId: 'trans-auto',
        bodyTypeId: 'body-sedan',
        driveTypeId: 'drive-fwd',
        colorId: 'color-white',
      },
    });

    assert.equal(body.vehicleDetails.makeId, 'brand-toyota');
    assert.equal(
      (body.vehicleDetails as { brandId?: string }).brandId,
      undefined,
    );
    assert.equal(body.vehicleDetails.modelId, 'model-camry');
    assert.equal(body.vehicleDetails.fuelTypeId, 'fuel-petrol');
    assert.equal(body.vehicleDetails.transmissionTypeId, 'trans-auto');
    assert.equal(body.vehicleDetails.bodyTypeId, 'body-sedan');
    assert.equal(body.vehicleDetails.driveTypeId, 'drive-fwd');
    assert.equal(body.vehicleDetails.colorId, 'color-white');
    assert.equal(body.vehicleDetails.year, 2020);
    assert.equal(body.vehicleDetails.mileageKm, 45000);
  });

  it('appends negotiable note via shared listing helper', () => {
    const body = buildCreateVehicleBody({
      ...DEFAULT_COMMON_STATE,
      categoryCode: 'CAR',
      categoryId: 'cat-car',
      cityId: 'city-1',
      title: '2020 Camry',
      description: 'Clean Camry',
      primaryPrice: '15000000',
      negotiable: true,
      domainData: {
        ...DEFAULT_VEHICLE_DOMAIN_DATA,
        year: '2020',
        mileageKm: '1000',
        fuelTypeId: 'f',
        transmissionTypeId: 't',
      },
    });
    assert.match(body.description, /Price is negotiable/);
  });

  it('requires fuel, transmission, and mileage for CAR', () => {
    const incomplete = {
      ...DEFAULT_COMMON_STATE,
      categoryCode: 'CAR' as const,
      title: 'Test car title',
      description: 'Long enough description',
      domainData: {
        ...DEFAULT_VEHICLE_DOMAIN_DATA,
        year: '2020',
        mileageKm: '',
      },
    };
    assert.equal(validateVehicleDetailsStep(incomplete), false);

    const complete = {
      ...incomplete,
      domainData: {
        ...DEFAULT_VEHICLE_DOMAIN_DATA,
        year: '2020',
        mileageKm: '1000',
        fuelTypeId: 'fuel-1',
        transmissionTypeId: 'trans-1',
      },
    };
    assert.equal(validateVehicleDetailsStep(complete), true);
  });

  it('does not require catalog specs for HEAVY_EQUIPMENT', () => {
    const he = {
      ...DEFAULT_COMMON_STATE,
      categoryCode: 'HEAVY_EQUIPMENT' as const,
      title: 'Excavator unit',
      description: 'Heavy equipment listing',
      domainData: {
        ...DEFAULT_VEHICLE_DOMAIN_DATA,
        year: '2019',
      },
    };
    assert.equal(validateVehicleDetailsStep(he), true);
  });
});

describe('vehicle sell submit edit mode (P5-9)', () => {
  const state = {
    ...DEFAULT_COMMON_STATE,
    categoryId: 'cat',
    cityId: 'city',
    title: 'Edit me please',
    description: 'Long enough description',
    primaryPrice: '1000',
    domainData: { ...DEFAULT_VEHICLE_DOMAIN_DATA, year: '2020' },
  };

  it('PATCHes existing listing and never creates', async () => {
    const calls: string[] = [];
    const result = await submitVehicleListing(
      {
        createVehicle: async () => {
          calls.push('create');
          return { id: 'new' };
        },
        updateVehicle: async (id) => {
          calls.push(`update:${id}`);
          return { id };
        },
        changeStatus: async () => {
          calls.push('status');
        },
      },
      {
        state,
        listingId: 'listing-9',
        submitForReview: false,
        mode: 'edit',
        attachMedia: async () => {
          calls.push('media');
        },
      },
    );
    assert.equal(result.listingId, 'listing-9');
    assert.deepEqual(calls, ['update:listing-9', 'media']);
  });

  it('requires listingId in edit mode', async () => {
    await assert.rejects(
      () =>
        submitVehicleListing(
          {
            createVehicle: async () => ({ id: 'x' }),
            updateVehicle: async (id) => ({ id }),
            changeStatus: async () => undefined,
          },
          {
            state,
            listingId: null,
            submitForReview: false,
            mode: 'edit',
            attachMedia: async () => undefined,
          },
        ),
      /listingId/,
    );
  });
});
