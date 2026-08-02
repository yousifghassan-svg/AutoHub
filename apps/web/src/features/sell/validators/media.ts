import type { SellStepValidator } from '../core/types';

/** Vehicles require ≥1 image before leaving the media step; plates skip this step. */
export const validateMediaStep: SellStepValidator = (state) =>
  state.categoryCode === 'PLATE' || state.imageAssetIds.length > 0;
