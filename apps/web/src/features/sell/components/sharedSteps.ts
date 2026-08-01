import type { ComponentType } from 'react';
import type { SellStepId, SellStepProps } from '../core/types';
import { CategoryStep } from './steps/CategoryStep';
import { MediaStep } from './steps/MediaStep';
import { SaleInformationStep } from './steps/SaleInformationStep';

/**
 * Domain-agnostic steps available to every marketplace workflow.
 * Domain plugins supply only domain-specific steps + Preview.
 */
export const SHARED_SELL_STEPS: Readonly<
  Partial<Record<SellStepId, ComponentType<SellStepProps>>>
> = {
  category: CategoryStep,
  media: MediaStep,
  saleInformation: SaleInformationStep,
};
