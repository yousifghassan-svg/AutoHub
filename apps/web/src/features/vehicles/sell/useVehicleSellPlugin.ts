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
import { submitVehicleListing } from './submit';
import { VehicleDetailsStep } from './steps/VehicleDetailsStep';
import { VehiclePreview } from './steps/VehiclePreview';
import { validateVehicleDetailsStep } from './validators';

export function useVehicleSellPlugin(): SellDomainPlugin {
  const { createVehicle, changeStatus } = useDomainMutations();

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
      }),
      mapDraftToDomain: mapVehicleDraftToDomain,
      serializeDomainData: serializeVehicleDomainData,
      canSubmit: (state) =>
        validateVehicleDetailsStep(state) &&
        validateSaleInformationStep(state),
      submit: (args) =>
        submitVehicleListing(
          {
            createVehicle: (body) => createVehicle.mutateAsync(body),
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
    [changeStatus, createVehicle],
  );
}
