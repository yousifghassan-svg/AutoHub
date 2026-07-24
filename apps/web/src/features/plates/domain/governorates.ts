import type { GovernorateMeta, IraqiGovernorate, PlateType } from './types';

export const GOVERNORATES: Record<IraqiGovernorate, GovernorateMeta> = {
  Erbil: {
    id: 'Erbil',
    nameEn: 'Erbil',
    nameAr: 'أربيل',
    nameKu: 'هەولێر',
    defaultCode: '22',
    formatCode: 'IQ_ERBIL',
  },
  Baghdad: {
    id: 'Baghdad',
    nameEn: 'Baghdad',
    nameAr: 'بغداد',
    defaultCode: '11',
    formatCode: 'IQ_BAGHDAD',
  },
  Duhok: {
    id: 'Duhok',
    nameEn: 'Duhok',
    nameAr: 'دهوك',
    nameKu: 'دهۆک',
    defaultCode: '27',
    formatCode: 'IQ_DUHOK',
  },
  Sulaymaniyah: {
    id: 'Sulaymaniyah',
    nameEn: 'Sulaymaniyah',
    nameAr: 'السليمانية',
    nameKu: 'سلێمانی',
    defaultCode: '25',
    formatCode: 'IQ_SULAYMANIYAH',
  },
  Basra: {
    id: 'Basra',
    nameEn: 'Basra',
    nameAr: 'البصرة',
    defaultCode: '14',
    formatCode: 'IQ_BASRA',
  },
  Mosul: {
    id: 'Mosul',
    nameEn: 'Mosul',
    nameAr: 'الموصل',
    defaultCode: '15',
    formatCode: 'IQ_MOSUL',
  },
  Kirkuk: {
    id: 'Kirkuk',
    nameEn: 'Kirkuk',
    nameAr: 'كركوك',
    nameKu: 'کەرکووک',
    defaultCode: '16',
    formatCode: 'IQ_KIRKUK',
  },
};

/** Plate type is metadata only — visual plate face is always flat white. */
export const PLATE_TYPE_LABELS: Record<PlateType, string> = {
  Private: 'Private',
  Taxi: 'Taxi',
  Government: 'Government',
  Commercial: 'Commercial',
  Diplomatic: 'Diplomatic',
};

export function formatCodeFor(governorate: IraqiGovernorate): string {
  return GOVERNORATES[governorate].formatCode;
}

export function governorateFromFormatCode(
  formatCode: string | null | undefined,
): IraqiGovernorate | null {
  if (!formatCode) return null;
  const entry = Object.values(GOVERNORATES).find((g) => g.formatCode === formatCode);
  return entry?.id ?? null;
}

export function buildPlateDisplay(code: string, letter: string, number: string): string {
  return [code.trim(), letter.trim().toUpperCase(), number.trim()]
    .filter(Boolean)
    .join(' ');
}

export function normalizePlate(code: string, letter: string, number: string): string {
  return buildPlateDisplay(code, letter, number).replace(/\s+/g, '').toUpperCase();
}
