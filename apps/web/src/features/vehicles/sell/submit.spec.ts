import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DEFAULT_COMMON_STATE } from '../../sell/core/types';
import { DEFAULT_VEHICLE_DOMAIN_DATA } from './domain-data';
import { buildCreateVehicleBody } from './submit';
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
