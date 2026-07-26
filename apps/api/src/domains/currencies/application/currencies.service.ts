import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Money } from '@autohub/utils';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

export type CurrencyDto = {
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

@Injectable()
export class CurrenciesService {
  constructor(private readonly prisma: PrismaService) {}

  async listActive(): Promise<CurrencyDto[]> {
    const rows = await this.prisma.currency.findMany({
      where: { active: true, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });
    return rows.map((row) => this.toDto(row));
  }

  async getByCode(code: string) {
    const currency = await this.prisma.currency.findFirst({
      where: { code: code.trim().toUpperCase(), deletedAt: null },
    });
    if (!currency) throw new NotFoundException(`Currency ${code} not found`);
    return currency;
  }

  async getDefault() {
    const currency = await this.prisma.currency.findFirst({
      where: { isDefault: true, active: true, deletedAt: null },
    });
    if (currency) return currency;
    return this.getByCode('IQD');
  }

  async assertActiveCode(code: string) {
    const currency = await this.prisma.currency.findFirst({
      where: {
        code: code.trim().toUpperCase(),
        active: true,
        deletedAt: null,
      },
    });
    if (!currency) {
      throw new BadRequestException(`Invalid or inactive currency: ${code}`);
    }
    return currency;
  }

  async assertActiveId(id: string) {
    const currency = await this.prisma.currency.findFirst({
      where: { id, active: true, deletedAt: null },
    });
    if (!currency) {
      throw new BadRequestException('Invalid or inactive currency');
    }
    return currency;
  }

  /**
   * Resolve write input to an active Currency. Prefers currencyCode; falls back to id; defaults to IQD.
   */
  async resolvePrimaryCurrency(input: {
    currencyCode?: string | null;
    primaryCurrencyId?: string | null;
  }) {
    if (input.currencyCode?.trim()) {
      return this.assertActiveCode(input.currencyCode);
    }
    if (input.primaryCurrencyId?.trim()) {
      return this.assertActiveId(input.primaryCurrencyId);
    }
    return this.getDefault();
  }

  assertPrice(amount: number | null | undefined, field = 'primaryPrice') {
    if (amount === undefined || amount === null) {
      throw new BadRequestException(`${field} is required`);
    }
    Money.of(amount, 'IQD').assertNonNegative();
    if (amount < 0) {
      throw new BadRequestException(`${field} must be >= 0`);
    }
  }

  private toDto(row: {
    id: string;
    code: string;
    nameEn: string;
    nameAr: string;
    nameKu: string | null;
    symbol: string;
    decimalPlaces: number;
    active: boolean;
    isDefault: boolean;
    sortOrder: number;
  }): CurrencyDto {
    return {
      id: row.id,
      code: row.code,
      nameEn: row.nameEn,
      nameAr: row.nameAr,
      nameKu: row.nameKu,
      symbol: row.symbol,
      decimalPlaces: row.decimalPlaces,
      isActive: row.active,
      isDefault: row.isDefault,
      sortOrder: row.sortOrder,
    };
  }
}
