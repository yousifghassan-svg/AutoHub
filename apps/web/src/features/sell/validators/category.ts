import type { SellStepValidator } from '../core/types';

/** Listing type + location: category catalog id, governorate, and city required. */
export const validateCategoryStep: SellStepValidator = (state) =>
  Boolean(state.categoryId && state.governorateId && state.cityId);
