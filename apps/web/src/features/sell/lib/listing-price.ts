import { PHASE1_CURRENCY_CODES } from '@/features/currencies/domain/types';

/** Listing-generic sell currencies (not vehicle-specific). */
export const SELL_CURRENCY_CODES = PHASE1_CURRENCY_CODES;

export type SellCurrencyCode = (typeof SELL_CURRENCY_CODES)[number];

export function isSellCurrencyCode(code: string): code is SellCurrencyCode {
  return (SELL_CURRENCY_CODES as readonly string[]).includes(code);
}

export function parseListingPrice(raw: string): number | null {
  if (raw.trim() === '') return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return n;
}

/** Price must be a finite number ≥ 0. Zero allowed only when product says so — sell requires > 0. */
export function isValidListingSalePrice(raw: string): boolean {
  const n = parseListingPrice(raw);
  return n != null && n > 0;
}

export function priceStepForCurrency(currencyCode: string): string {
  return currencyCode === 'USD' ? '0.01' : '1';
}
