import type { GovernorateMeta, IraqiGovernorate } from './types';

export const GOVERNORATES: Record<IraqiGovernorate, GovernorateMeta> = {
  Erbil: {
    id: 'Erbil',
    nameEn: 'Erbil',
    nameAr: 'أربيل',
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
    defaultCode: '27',
    formatCode: 'IQ_DUHOK',
  },
  Sulaymaniyah: {
    id: 'Sulaymaniyah',
    nameEn: 'Sulaymaniyah',
    nameAr: 'السليمانية',
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
    defaultCode: '16',
    formatCode: 'IQ_KIRKUK',
  },
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
