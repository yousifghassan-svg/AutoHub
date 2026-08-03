'use client';

import { useMemo } from 'react';
import { useDomainMutations } from '@/features/listings/hooks/useDomainMutations';
import type { SellDomainPlugin } from '@/features/sell/core/types';
import { WORKFLOW_PLATE_LISTING } from '@/features/sell/core/workflows';
import {
  validateCategoryStep,
  validatePublishStep,
  validateSaleInformationStep,
} from '@/features/sell/validators';
import { evaluateWizardListingQuality } from '@/features/sell/quality/adapt-wizard-state';
import {
  createInitialPlateDomainData,
  mapPlateDraftToDomain,
  serializePlateDomainData,
} from './draft';
import { createPlateListingQualityRules } from './quality-rules';
import { submitPlateListing } from './submit';
import { PlateDetailsStep } from './steps/PlateDetailsStep';
import { PlatePreview } from './steps/PlatePreview';
import { validatePlateDetailsStep } from './validators';

export function usePlateSellPlugin(): SellDomainPlugin {
  const { createPlate, updatePlate, changeStatus } = useDomainMutations();

  return useMemo(
    () => ({
      id: 'PLATE',
      categoryCodes: ['PLATE'],
      workflowId: WORKFLOW_PLATE_LISTING.id,
      steps: {
        plateDetails: PlateDetailsStep,
      },
      Preview: PlatePreview,
      validators: {
        category: validateCategoryStep,
        plateDetails: validatePlateDetailsStep,
        saleInformation: validateSaleInformationStep,
        publish: validatePublishStep,
      },
      createInitialDomainData: createInitialPlateDomainData,
      mapDraftToDomain: mapPlateDraftToDomain,
      serializeDomainData: serializePlateDomainData,
      getQualityRules: () => createPlateListingQualityRules(),
      canSubmit: (state) =>
        evaluateWizardListingQuality(
          state,
          createPlateListingQualityRules(),
        ).canPublish,
      submit: (args) =>
        submitPlateListing(
          {
            createPlate: (body) => createPlate.mutateAsync(body),
            updatePlate: (id, body) => updatePlate.mutateAsync({ id, body }),
            changeStatus: ({ id, status }) =>
              changeStatus.mutateAsync({
                id,
                status,
                domain: 'PLATE',
              }),
          },
          args,
        ),
    }),
    [changeStatus, createPlate, updatePlate],
  );
}
