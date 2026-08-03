import {
  createCommonListingQualityRules,
  type ListingQualityRule,
} from '@autohub/utils';

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function plateFromDomain(domainData: Record<string, unknown>): {
  code: string;
  letter: string;
  number: string;
} {
  const plate = domainData.plate;
  if (plate && typeof plate === 'object') {
    const p = plate as Record<string, unknown>;
    return {
      code: str(p.code),
      letter: str(p.letter),
      number: str(p.number),
    };
  }
  return { code: '', letter: '', number: '' };
}

/**
 * Plate listing quality rules.
 * Title is recommended (auto-generated on submit); photos are recommended.
 */
export function createPlateListingQualityRules(): ListingQualityRule[] {
  return [
    ...createCommonListingQualityRules({
      requireTitle: false,
      minTitleLength: 3,
      minPhotosRequired: 0,
      minPhotosRecommended: 1,
      minPhotosPremium: 3,
      requireVideoPremium: true,
    }),
    {
      id: 'plate.identity',
      severity: 'required',
      label: 'Plate identity',
      recommendation: 'Enter plate code, letter, and number.',
      weight: 16,
      evaluate: (ctx) => {
        const plate = plateFromDomain(ctx.domainData);
        return Boolean(plate.code && plate.letter && plate.number);
      },
    },
  ];
}
