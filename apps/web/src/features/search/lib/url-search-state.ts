import type { MarketplaceSearchQuery, SearchSort } from '../domain/types';
import { SEARCH_SORTS } from '../domain/types';

const SORT_IDS = new Set(SEARCH_SORTS.map((s) => s.id));

function num(v: string | null): number | undefined {
  if (v == null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function flag(v: string | null): boolean | undefined {
  if (v === '1' || v === 'true') return true;
  return undefined;
}

/** Hydrate marketplace search state from URLSearchParams. */
export function parseSearchParams(
  params: URLSearchParams,
  defaults?: Partial<MarketplaceSearchQuery>,
): MarketplaceSearchQuery {
  const sortRaw = params.get('sort');
  const sort =
    sortRaw && SORT_IDS.has(sortRaw as SearchSort)
      ? (sortRaw as SearchSort)
      : defaults?.sort ?? 'NEWEST';

  return {
    domain: defaults?.domain,
    q: params.get('q') ?? undefined,
    categoryCode:
      params.get('categoryCode') ?? params.get('category') ?? undefined,
    brandId: params.get('brandId') ?? undefined,
    modelId: params.get('modelId') ?? undefined,
    bodyTypeId: params.get('bodyTypeId') ?? undefined,
    colorId: params.get('colorId') ?? undefined,
    driveTypeId: params.get('driveTypeId') ?? undefined,
    conditionTypeId: params.get('conditionTypeId') ?? undefined,
    governorateId: params.get('governorateId') ?? undefined,
    cityId: params.get('cityId') ?? undefined,
    currencyCode: params.get('currency') ?? params.get('currencyCode') ?? 'IQD',
    minPrice: num(params.get('minPrice')),
    maxPrice: num(params.get('maxPrice')),
    minYear: num(params.get('minYear')),
    maxYear: num(params.get('maxYear')),
    minMileage: num(params.get('minMileage')),
    maxMileage: num(params.get('maxMileage')),
    fuelTypeId: params.get('fuelTypeId') ?? undefined,
    transmissionTypeId: params.get('transmissionTypeId') ?? undefined,
    featuredOnly: flag(params.get('featured') ?? params.get('featuredOnly')),
    verifiedOnly: flag(params.get('verified') ?? params.get('verifiedOnly')),
    formatCode: params.get('formatCode') ?? undefined,
    prefix: params.get('prefix') ?? undefined,
    series: params.get('series') ?? params.get('letter') ?? undefined,
    number: params.get('number') ?? undefined,
    digits: num(params.get('digits')),
    sort,
    pageSize: defaults?.pageSize ?? 12,
  };
}

/** Serialize search state to URL query (filters + sort; page omitted for shareability). */
export function toSearchParams(query: MarketplaceSearchQuery): URLSearchParams {
  const sp = new URLSearchParams();
  if (query.q) sp.set('q', query.q);
  if (query.categoryCode) sp.set('category', query.categoryCode);
  if (query.brandId) sp.set('brandId', query.brandId);
  if (query.modelId) sp.set('modelId', query.modelId);
  if (query.bodyTypeId) sp.set('bodyTypeId', query.bodyTypeId);
  if (query.colorId) sp.set('colorId', query.colorId);
  if (query.driveTypeId) sp.set('driveTypeId', query.driveTypeId);
  if (query.conditionTypeId) sp.set('conditionTypeId', query.conditionTypeId);
  if (query.governorateId) sp.set('governorateId', query.governorateId);
  if (query.cityId) sp.set('cityId', query.cityId);
  if (query.currencyCode && query.currencyCode !== 'IQD') {
    sp.set('currency', query.currencyCode);
  } else if (query.currencyCode === 'IQD') {
    // keep currency when non-default price filters present
    if (query.minPrice != null || query.maxPrice != null) {
      sp.set('currency', 'IQD');
    }
  }
  if (query.minPrice != null) sp.set('minPrice', String(query.minPrice));
  if (query.maxPrice != null) sp.set('maxPrice', String(query.maxPrice));
  if (query.minYear != null) sp.set('minYear', String(query.minYear));
  if (query.maxYear != null) sp.set('maxYear', String(query.maxYear));
  if (query.minMileage != null) sp.set('minMileage', String(query.minMileage));
  if (query.maxMileage != null) sp.set('maxMileage', String(query.maxMileage));
  if (query.fuelTypeId) sp.set('fuelTypeId', query.fuelTypeId);
  if (query.transmissionTypeId) {
    sp.set('transmissionTypeId', query.transmissionTypeId);
  }
  if (query.featuredOnly) sp.set('featured', '1');
  if (query.verifiedOnly) sp.set('verified', '1');
  if (query.formatCode) sp.set('formatCode', query.formatCode);
  if (query.prefix) sp.set('prefix', query.prefix);
  if (query.series) sp.set('letter', query.series);
  if (query.number) sp.set('number', query.number);
  if (query.digits != null) sp.set('digits', String(query.digits));
  if (query.sort && query.sort !== 'NEWEST') sp.set('sort', query.sort);
  return sp;
}

export function pushSearchUrl(
  pathname: string,
  query: MarketplaceSearchQuery,
  router: { replace: (href: string) => void },
) {
  const sp = toSearchParams(query);
  const qs = sp.toString();
  router.replace(qs ? `${pathname}?${qs}` : pathname);
}
