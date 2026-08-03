'use client';

import { useMemo } from 'react';
import { useDomainMutations } from '@/features/listings/hooks/useDomainMutations';
import type { SellDomainPlugin } from '@/features/sell/core/types';
import { WORKFLOW_VEHICLE_LISTING } from '@/features/sell/core/workflows';
import {
  validateCategoryStep,
  validateMediaStep,
  validatePublishStep,
  validateSaleInformationStep,
} from '@/features/sell/validators';
import { VEHICLE_CATEGORY_CODES } from '../domain/types';
import {
  createInitialVehicleDomainData,
  mapVehicleDraftToDomain,
  serializeVehicleDomainData,
} from './draft';
import { evaluateWizardListingQuality } from '@/features/sell/quality/adapt-wizard-state';
import { createVehicleListingQualityRules } from './quality-rules';
import { submitVehicleListing } from './submit';
import { VehicleDetailsStep } from './steps/VehicleDetailsStep';
import { VehiclePreview } from './steps/VehiclePreview';
import { validateVehicleDetailsStep } from './validators';

export function useVehicleSellPlugin(): SellDomainPlugin {
  const { createVehicle, updateVehicle, changeStatus } = useDomainMutations();

  return useMemo(
    () => ({
      id: 'VEHICLE',
      categoryCodes: VEHICLE_CATEGORY_CODES,
      workflowId: WORKFLOW_VEHICLE_LISTING.id,
      steps: {
        vehicleDetails: VehicleDetailsStep,
      },
      Preview: VehiclePreview,
      validators: {
        category: validateCategoryStep,
        vehicleDetails: validateVehicleDetailsStep,
        media: validateMediaStep,
        saleInformation: validateSaleInformationStep,
        publish: validatePublishStep,
      },
      createInitialDomainData: createInitialVehicleDomainData,
      onCategoryChange: (domainData) => ({
        ...domainData,
        brandId: '',
        modelId: '',
        fuelTypeId: '',
        transmissionTypeId: '',
        bodyTypeId: '',
        driveTypeId: '',
        colorId: '',
        vin: '',
      }),
      mapDraftToDomain: mapVehicleDraftToDomain,
      serializeDomainData: serializeVehicleDomainData,
      getQualityRules: (state) =>
        createVehicleListingQualityRules(state.categoryCode),
      canSubmit: (state) =>
        evaluateWizardListingQuality(
          state,
          createVehicleListingQualityRules(state.categoryCode),
        ).canPublish,
      submit: (args) =>
        submitVehicleListing(
          {
            createVehicle: (body) => createVehicle.mutateAsync(body),
            updateVehicle: (id, body) =>
              updateVehicle.mutateAsync({ id, body }),
            changeStatus: ({ id, status }) =>
              changeStatus.mutateAsync({
                id,
                status,
                domain: 'VEHICLE',
              }),
          },
          args,
        ),
    }),
    [changeStatus, createVehicle, updateVehicle],
  );
}
