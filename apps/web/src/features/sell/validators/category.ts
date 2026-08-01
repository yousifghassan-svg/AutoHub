import type { SellStepValidator } from '../core/types';

export const validateCategoryStep: SellStepValidator = (state) =>
  Boolean(state.categoryId && state.cityId);
