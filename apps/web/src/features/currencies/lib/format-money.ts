import { formatMoney as sharedFormatMoney } from '@autohub/utils';

export type AppLocale = 'ar' | 'ku' | 'en';

export function formatMoney(
  amount: number | null | undefined,
  currencyCode = 'IQD',
  locale: AppLocale = 'en',
): string {
  return sharedFormatMoney(amount, currencyCode, locale);
}
