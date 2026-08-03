import type { SellStepValidator } from '../core/types';
import { resolveSellDomain } from '../core/registry';
import { evaluateWizardListingQuality } from '../quality/adapt-wizard-state';

/**
 * Publish-step gate: all required listing-quality items must pass.
 * Recommended / premium never block.
 */
export const validatePublishStep: SellStepValidator = (state) => {
  const plugin = resolveSellDomain(state.categoryCode);
  if (!plugin?.getQualityRules) return false;
  return evaluateWizardListingQuality(state, plugin.getQualityRules(state))
    .canPublish;
};
