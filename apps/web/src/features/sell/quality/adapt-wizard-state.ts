import type {
  ListingQualityContext,
  ListingQualityResult,
  ListingQualityRule,
} from '@autohub/utils';
import { evaluateListingQuality } from '@autohub/utils';
import type { SellWizardState } from '../core/types';

/** Map sell wizard state into the listing-generic quality context. */
export function wizardStateToQualityContext(
  state: SellWizardState,
): ListingQualityContext {
  return {
    common: {
      categoryCode: state.categoryCode,
      categoryId: state.categoryId,
      governorateId: state.governorateId,
      cityId: state.cityId,
      title: state.title,
      description: state.description,
      primaryPrice: state.primaryPrice,
      currencyCode: state.currencyCode,
      imageAssetIds: state.imageAssetIds,
      videoAssetIds: state.videoAssetIds,
    },
    domainData: state.domainData ?? {},
  };
}

export function evaluateWizardListingQuality(
  state: SellWizardState,
  rules: ListingQualityRule[],
): ListingQualityResult {
  return evaluateListingQuality(wizardStateToQualityContext(state), rules);
}
