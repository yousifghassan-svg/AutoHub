/** ISO-like currency codes. Phase 1: IQD + USD; catalog is DB-driven for more. */
export type MoneyCurrencyCode = string;

export type MoneyLocale = 'ar' | 'ku' | 'en' | string;

const LOCALE_MAP: Record<string, string> = {
  ar: 'ar-IQ',
  ku: 'ckb-IQ',
  en: 'en-IQ',
};

const DEFAULT_DECIMAL_PLACES: Record<string, number> = {
  IQD: 0,
  USD: 2,
  AED: 2,
  EUR: 2,
  SAR: 2,
  TRY: 2,
  GBP: 2,
};

export class CurrencyMismatchError extends Error {
  constructor(left: string, right: string) {
    super(`Cannot compare Money in different currencies: ${left} vs ${right}`);
    this.name = 'CurrencyMismatchError';
  }
}

export class Money {
  readonly amount: number;
  readonly currency: MoneyCurrencyCode;
  readonly decimalPlaces: number;

  private constructor(
    amount: number,
    currency: MoneyCurrencyCode,
    decimalPlaces: number,
  ) {
    this.amount = amount;
    this.currency = currency.toUpperCase();
    this.decimalPlaces = decimalPlaces;
  }

  static of(
    amount: number,
    currency: MoneyCurrencyCode,
    decimalPlaces?: number,
  ): Money {
    if (!Number.isFinite(amount)) {
      throw new Error('Money amount must be a finite number');
    }
    const code = currency.trim().toUpperCase();
    if (!code) throw new Error('Money currency is required');
    const places =
      decimalPlaces ?? DEFAULT_DECIMAL_PLACES[code] ?? 2;
    return new Money(amount, code, places);
  }

  static assertSameCurrency(a: Money, b: Money): void {
    if (a.currency !== b.currency) {
      throw new CurrencyMismatchError(a.currency, b.currency);
    }
  }

  assertNonNegative(): this {
    if (this.amount < 0) {
      throw new Error(`Money amount must be >= 0 (got ${this.amount})`);
    }
    return this;
  }

  equals(other: Money): boolean {
    Money.assertSameCurrency(this, other);
    return this.amount === other.amount;
  }

  compare(other: Money): -1 | 0 | 1 {
    Money.assertSameCurrency(this, other);
    if (this.amount < other.amount) return -1;
    if (this.amount > other.amount) return 1;
    return 0;
  }

  format(locale: MoneyLocale = 'en'): string {
    const bcp47 = LOCALE_MAP[locale] ?? locale;
    try {
      return new Intl.NumberFormat(bcp47, {
        style: 'currency',
        currency: this.currency,
        minimumFractionDigits: this.decimalPlaces,
        maximumFractionDigits: this.decimalPlaces,
      }).format(this.amount);
    } catch {
      const formatted = this.amount.toLocaleString(bcp47, {
        minimumFractionDigits: this.decimalPlaces,
        maximumFractionDigits: this.decimalPlaces,
      });
      return `${this.currency} ${formatted}`;
    }
  }
}

export function formatMoney(
  amount: number | null | undefined,
  currencyCode: MoneyCurrencyCode = 'IQD',
  locale: MoneyLocale = 'en',
  decimalPlaces?: number,
): string {
  if (amount == null || !Number.isFinite(amount)) return '—';
  return Money.of(amount, currencyCode, decimalPlaces).format(locale);
}

export function toBcp47Locale(locale: MoneyLocale): string {
  return LOCALE_MAP[locale] ?? locale;
}
