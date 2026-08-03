import type { SellStepValidator } from '../core/types';
import {
  isSellCurrencyCode,
  isValidListingSalePrice,
} from '../lib/listing-price';

/** Listing-generic price + currency gate (shared by all domain plugins). */
export const validateSaleInformationStep: SellStepValidator = (state) =>
  isValidListingSalePrice(state.primaryPrice) &&
  isSellCurrencyCode(state.currencyCode);
