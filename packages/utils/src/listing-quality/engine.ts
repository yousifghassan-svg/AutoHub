import type {
  ListingQualityContext,
  ListingQualityGrade,
  ListingQualityItem,
  ListingQualityResult,
  ListingQualityRule,
} from './types';

const SEVERITY_ORDER = {
  required: 0,
  recommended: 1,
  premium: 2,
} as const;

export function listingQualityGrade(score: number): ListingQualityGrade {
  if (score < 40) return 'needs_work';
  if (score < 65) return 'ok';
  if (score < 85) return 'good';
  return 'excellent';
}

export function listingQualityGradeLabel(grade: ListingQualityGrade): string {
  switch (grade) {
    case 'needs_work':
      return 'Needs work';
    case 'ok':
      return 'OK';
    case 'good':
      return 'Good';
    case 'excellent':
      return 'Excellent';
    default:
      return 'OK';
  }
}

function percent(ok: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((ok / total) * 100);
}

/**
 * Evaluate listing quality from plugin + common rules.
 * Engine owns score, progress, recommendations, and canPublish.
 */
export function evaluateListingQuality(
  ctx: ListingQualityContext,
  rules: ListingQualityRule[],
): ListingQualityResult {
  const items: ListingQualityItem[] = rules.map((rule) => ({
    id: rule.id,
    severity: rule.severity,
    label: rule.label,
    recommendation: rule.recommendation,
    weight: rule.weight,
    ok: Boolean(rule.evaluate(ctx)),
  }));

  const required = items.filter((i) => i.severity === 'required');
  const missingRequired = required.filter((i) => !i.ok);
  const missingRecommended = items.filter(
    (i) => i.severity === 'recommended' && !i.ok,
  );
  const missingPremium = items.filter(
    (i) => i.severity === 'premium' && !i.ok,
  );

  const canPublish = missingRequired.length === 0;

  const totalWeight = items.reduce((sum, i) => sum + Math.max(0, i.weight), 0);
  const earnedWeight = items
    .filter((i) => i.ok)
    .reduce((sum, i) => sum + Math.max(0, i.weight), 0);

  let score =
    totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  // Incomplete required listings stay below “Good” until mandatory items are done.
  if (!canPublish) score = Math.min(score, 45);
  score = Math.max(0, Math.min(100, score));

  const grade = canPublish
    ? listingQualityGrade(score)
    : ('needs_work' as const);

  const recommendations = [...items]
    .filter((i) => !i.ok)
    .sort(
      (a, b) =>
        SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
        b.weight - a.weight,
    )
    .map((i) => i.recommendation)
    .slice(0, 6);

  return {
    items,
    missingRequired,
    missingRecommended,
    missingPremium,
    canPublish,
    completionPercent: percent(
      items.filter((i) => i.ok).length,
      items.length,
    ),
    requiredCompletionPercent: percent(
      required.filter((i) => i.ok).length,
      required.length,
    ),
    score,
    grade,
    recommendations,
  };
}
