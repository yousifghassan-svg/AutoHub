import { config } from '@/lib/config';
import type { CurrencyCatalogItem } from '../domain/types';

type Envelope<T> = { success?: boolean; data?: T } | T;

function unwrap<T>(json: Envelope<T>): T {
  if (json && typeof json === 'object' && 'data' in json && json.data !== undefined) {
    return json.data as T;
  }
  return json as T;
}

export async function fetchActiveCurrencies(): Promise<CurrencyCatalogItem[]> {
  const res = await fetch(`${config.apiUrl}/v1/currencies`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    return [
      {
        id: 'curr_iqd',
        code: 'IQD',
        nameEn: 'Iraqi Dinar',
        nameAr: 'الدينار العراقي',
        nameKu: 'دیناری عێراقی',
        symbol: 'د.ع',
        decimalPlaces: 0,
        isActive: true,
        isDefault: true,
        sortOrder: 10,
      },
      {
        id: 'curr_usd',
        code: 'USD',
        nameEn: 'US Dollar',
        nameAr: 'الدولار الأمريكي',
        nameKu: 'دۆلاری ئەمریکی',
        symbol: '$',
        decimalPlaces: 2,
        isActive: true,
        isDefault: false,
        sortOrder: 20,
      },
    ];
  }
  const json = (await res.json()) as Envelope<CurrencyCatalogItem[]>;
  const data = unwrap(json);
  return Array.isArray(data) ? data : [];
}
