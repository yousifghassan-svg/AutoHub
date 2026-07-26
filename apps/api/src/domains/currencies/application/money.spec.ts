import { CurrencyMismatchError, Money, formatMoney } from '@autohub/utils';

describe('Money value object', () => {
  it('formats IQD and USD', () => {
    expect(formatMoney(18_500_000, 'IQD', 'en')).toBeTruthy();
    expect(formatMoney(25_000, 'USD', 'en')).toBeTruthy();
  });

  it('compares same currency only', () => {
    expect(Money.of(10, 'USD').compare(Money.of(20, 'USD'))).toBe(-1);
    expect(() => Money.of(10, 'IQD').compare(Money.of(10, 'USD'))).toThrow(
      CurrencyMismatchError,
    );
  });
});
