export const IRAQI_GOVERNORATES = [
  'Erbil',
  'Baghdad',
  'Duhok',
  'Sulaymaniyah',
  'Basra',
  'Mosul',
  'Kirkuk',
] as const;

export type IraqiGovernorate = (typeof IRAQI_GOVERNORATES)[number];

export const PLATE_TYPES = [
  'Private',
  'Taxi',
  'Government',
  'Commercial',
  'Diplomatic',
] as const;

export type PlateType = (typeof PLATE_TYPES)[number];

export type LicensePlateProps = {
  governorate: IraqiGovernorate;
  code: string;
  letter: string;
  number: string;
  type: PlateType;
};

export type GovernorateMeta = {
  id: IraqiGovernorate;
  nameEn: string;
  nameAr: string;
  nameKu?: string;
  /** Suggested region code shown on the plate (editable). */
  defaultCode: string;
  formatCode: string;
};

export function isIraqiGovernorate(value: string): value is IraqiGovernorate {
  return (IRAQI_GOVERNORATES as readonly string[]).includes(value);
}

export function isPlateType(value: string): value is PlateType {
  return (PLATE_TYPES as readonly string[]).includes(value);
}
