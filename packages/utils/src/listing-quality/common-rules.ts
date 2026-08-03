import type { ListingQualityRule } from './types';

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function positivePrice(value: string): boolean {
  const n = Number(value);
  return value.trim().length > 0 && Number.isFinite(n) && n > 0;
}

/** Listing-generic required/recommended rules shared by every listing type. */
export function createCommonListingQualityRules(options?: {
  /** When false, title is recommended (auto-generated titles e.g. plates). */
  requireTitle?: boolean;
  minTitleLength?: number;
  minDescriptionLength?: number;
  /** When > 0, at least N photos are required. */
  minPhotosRequired?: number;
  /** Soft target for “enough photos”. */
  minPhotosRecommended?: number;
  minPhotosPremium?: number;
  requireVideoPremium?: boolean;
}): ListingQualityRule[] {
  const requireTitle = options?.requireTitle ?? true;
  const minTitle = options?.minTitleLength ?? 3;
  const minDesc = options?.minDescriptionLength ?? 10;
  const minPhotosRequired = options?.minPhotosRequired ?? 0;
  const minPhotosRecommended = options?.minPhotosRecommended ?? 3;
  const minPhotosPremium = options?.minPhotosPremium ?? 6;
  const requireVideoPremium = options?.requireVideoPremium ?? true;

  const rules: ListingQualityRule[] = [
    {
      id: 'listing.category',
      severity: 'required',
      label: 'Category selected',
      recommendation: 'Choose a listing category.',
      weight: 8,
      evaluate: (ctx) => Boolean(str(ctx.common.categoryId)),
    },
    {
      id: 'listing.location',
      severity: 'required',
      label: 'Location selected',
      recommendation: 'Select governorate and city.',
      weight: 10,
      evaluate: (ctx) =>
        Boolean(str(ctx.common.governorateId) && str(ctx.common.cityId)),
    },
    {
      id: 'listing.title',
      severity: requireTitle ? 'required' : 'recommended',
      label: 'Title completed',
      recommendation: `Add a clear title (at least ${minTitle} characters).`,
      weight: 10,
      evaluate: (ctx) => str(ctx.common.title).length >= minTitle,
    },
    {
      id: 'listing.description',
      severity: 'required',
      label: 'Description completed',
      recommendation: `Write a fuller description (at least ${minDesc} characters).`,
      weight: 12,
      evaluate: (ctx) => str(ctx.common.description).length >= minDesc,
    },
    {
      id: 'listing.price',
      severity: 'required',
      label: 'Price entered',
      recommendation: 'Enter a sale price greater than zero.',
      weight: 12,
      evaluate: (ctx) => positivePrice(ctx.common.primaryPrice),
    },
    {
      id: 'listing.currency',
      severity: 'required',
      label: 'Currency selected',
      recommendation: 'Choose IQD or USD.',
      weight: 6,
      evaluate: (ctx) => {
        const code = str(ctx.common.currencyCode).toUpperCase();
        return code === 'IQD' || code === 'USD';
      },
    },
    {
      id: 'listing.description_rich',
      severity: 'recommended',
      label: 'Detailed description',
      recommendation: 'Improve description — aim for 80+ characters with key details.',
      weight: 8,
      evaluate: (ctx) => str(ctx.common.description).length >= 80,
    },
  ];

  if (minPhotosRequired > 0) {
    rules.push({
      id: 'listing.photos_required',
      severity: 'required',
      label: 'Enough photos',
      recommendation: `Add at least ${minPhotosRequired} photo${minPhotosRequired === 1 ? '' : 's'}.`,
      weight: 14,
      evaluate: (ctx) => ctx.common.imageAssetIds.length >= minPhotosRequired,
    });
  }

  rules.push({
    id: 'listing.photos_recommended',
    severity: 'recommended',
    label: 'More photos',
    recommendation: `Add more photos (at least ${minPhotosRecommended}).`,
    weight: 10,
    evaluate: (ctx) => ctx.common.imageAssetIds.length >= minPhotosRecommended,
  });

  rules.push({
    id: 'listing.photos_premium',
    severity: 'premium',
    label: 'Photo gallery',
    recommendation: `Add a fuller gallery (${minPhotosPremium}+ photos) to stand out.`,
    weight: 6,
    evaluate: (ctx) => ctx.common.imageAssetIds.length >= minPhotosPremium,
  });

  if (requireVideoPremium) {
    rules.push({
      id: 'listing.video',
      severity: 'premium',
      label: 'Showcase video',
      recommendation: 'Add an optional video walk-around.',
      weight: 6,
      evaluate: (ctx) => ctx.common.videoAssetIds.length >= 1,
    });
  }

  return rules;
}

/** Helper for plugins: domain string field present. */
export function domainStringRule(input: {
  id: string;
  severity: ListingQualityRule['severity'];
  label: string;
  recommendation: string;
  weight: number;
  field: string;
}): ListingQualityRule {
  return {
    id: input.id,
    severity: input.severity,
    label: input.label,
    recommendation: input.recommendation,
    weight: input.weight,
    evaluate: (ctx) => Boolean(str(ctx.domainData[input.field])),
  };
}
