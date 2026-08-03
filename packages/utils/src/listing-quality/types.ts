/**
 * Listing Quality & Completeness Engine — platform types.
 * Engine is listing-generic. Plugins contribute rules; engine owns evaluation.
 */

export type ListingQualitySeverity = 'required' | 'recommended' | 'premium';

export type ListingQualityGrade =
  | 'needs_work'
  | 'ok'
  | 'good'
  | 'excellent';

/** Snapshot the engine evaluates — no vehicle/plate field names here. */
export type ListingQualityContext = {
  common: {
    categoryCode: string;
    categoryId: string;
    governorateId: string;
    cityId: string;
    title: string;
    description: string;
    primaryPrice: string;
    currencyCode: string;
    imageAssetIds: string[];
    videoAssetIds: string[];
  };
  /** Opaque domain payload — rule closures may read known keys. */
  domainData: Record<string, unknown>;
};

export type ListingQualityRule = {
  id: string;
  severity: ListingQualitySeverity;
  label: string;
  /** Actionable tip when the rule fails. */
  recommendation: string;
  /** Relative weight toward the 0–100 quality score. */
  weight: number;
  evaluate: (ctx: ListingQualityContext) => boolean;
};

export type ListingQualityItem = {
  id: string;
  severity: ListingQualitySeverity;
  label: string;
  recommendation: string;
  weight: number;
  ok: boolean;
};

export type ListingQualityResult = {
  items: ListingQualityItem[];
  missingRequired: ListingQualityItem[];
  missingRecommended: ListingQualityItem[];
  missingPremium: ListingQualityItem[];
  /** True only when every required rule passes. */
  canPublish: boolean;
  /** Share of all checklist items satisfied (0–100). */
  completionPercent: number;
  /** Share of required items satisfied (0–100). */
  requiredCompletionPercent: number;
  /** Weighted quality score (0–100). Capped while required items missing. */
  score: number;
  grade: ListingQualityGrade;
  /** Prioritized actionable tips (required → recommended → premium). */
  recommendations: string[];
};
