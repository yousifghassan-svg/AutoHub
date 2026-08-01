import type { SellStepValidator } from '../core/types';

/** Media is optional for marketplace sell flows. */
export const validateMediaStep: SellStepValidator = () => true;
