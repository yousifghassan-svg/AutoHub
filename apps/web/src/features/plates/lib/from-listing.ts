import type { ListingPlateModel } from '@/features/listings/domain/types';
import { GOVERNORATES, governorateFromFormatCode } from '../domain/governorates';
import { isPlateType, type LicensePlateProps, type PlateType } from '../domain/types';

export function licensePlateFromListing(
  plate: ListingPlateModel | null | undefined,
): LicensePlateProps | null {
  if (!plate) return null;
  const governorate = governorateFromFormatCode(plate.formatCode) ?? 'Baghdad';
  const meta = GOVERNORATES[governorate];
  const rawType = plate.plateType ?? '';
  const type: PlateType = isPlateType(rawType) ? rawType : 'Private';

  return {
    governorate,
    code: plate.regionCode?.trim() || meta.defaultCode,
    letter: plate.series?.trim() || 'A',
    number: plate.number?.trim() || plate.plateDisplay.replace(/\D/g, '').slice(-5) || '00000',
    type,
  };
}
