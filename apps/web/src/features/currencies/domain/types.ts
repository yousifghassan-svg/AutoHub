export type CurrencyCatalogItem = {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  nameKu: string | null;
  symbol: string;
  decimalPlaces: number;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
};

export const PHASE1_CURRENCY_CODES = ['IQD', 'USD'] as const;

export function priceRangeForCurrency(code: string): {
  max: number;
  step: number;
} {
  if (code === 'USD') return { max: 200_000, step: 500 };
  return { max: 200_000_000, step: 500_000 };
}
