import { BadRequestException } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';

describe('CurrenciesService', () => {
  const prisma = {
    currency: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };
  const service = new CurrenciesService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists active currencies with isActive alias', async () => {
    prisma.currency.findMany.mockResolvedValue([
      {
        id: 'curr_iqd',
        code: 'IQD',
        nameEn: 'Iraqi Dinar',
        nameAr: 'الدينار العراقي',
        nameKu: 'دیناری عێراقی',
        symbol: 'د.ع',
        decimalPlaces: 0,
        active: true,
        isDefault: true,
        sortOrder: 10,
      },
    ]);
    const rows = await service.listActive();
    expect(rows[0]).toMatchObject({ code: 'IQD', isActive: true, isDefault: true });
  });

  it('resolves currencyCode over id and defaults to IQD', async () => {
    prisma.currency.findFirst.mockResolvedValueOnce({
      id: 'curr_usd',
      code: 'USD',
      active: true,
    });
    const usd = await service.resolvePrimaryCurrency({ currencyCode: 'usd' });
    expect(usd.code).toBe('USD');

    prisma.currency.findFirst.mockResolvedValueOnce({
      id: 'curr_iqd',
      code: 'IQD',
      isDefault: true,
      active: true,
    });
    const def = await service.resolvePrimaryCurrency({});
    expect(def.code).toBe('IQD');
  });

  it('rejects inactive currency codes', async () => {
    prisma.currency.findFirst.mockResolvedValue(null);
    await expect(service.assertActiveCode('EUR')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
