import type { SellStepValidator } from '../core/types';

export const validateSaleInformationStep: SellStepValidator = (state) =>
  Boolean(state.primaryPrice && Number(state.primaryPrice) > 0);
