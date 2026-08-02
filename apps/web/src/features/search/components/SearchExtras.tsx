'use client';

import { useAuth } from '@/features/auth/AuthProvider';
import { Button } from '@/components/ui';
import {
  useRecentSearches,
  useSavedSearchMutations,
  useSavedSearches,
  useSearchSuggestions,
} from '../hooks/useMarketplaceSearch';
import type { MarketplaceSearchQuery, SearchSort } from '../domain/types';

type Props = {
  keyword: string;
  query: MarketplaceSearchQuery;
  onApplyKeyword: (q: string) => void;
  onApplyFilters: (patch: Partial<MarketplaceSearchQuery>) => void;
};

export function SearchExtras({
  keyword,
  query,
  onApplyKeyword,
  onApplyFilters,
}: Props) {
  const { status } = useAuth();
  const authed = status === 'authenticated';
  const suggestions = useSearchSuggestions(keyword, keyword.trim().length >= 2);
  const recent = useRecentSearches(authed);
  const saved = useSavedSearches(authed);
  const { save, remove } = useSavedSearchMutations();

  const onSave = () => {
    const name =
      query.q?.trim() ||
      [query.brandId, query.cityId, query.categoryCode].filter(Boolean).join(' · ') ||
      'Saved search';
    save.mutate({
      name,
      query: query.q,
      filters: { ...query } as Record<string, unknown>,
      sort: query.sort ?? 'NEWEST',
    });
  };

  return (
    <div className="space-y-4 text-sm">
      {suggestions.data && suggestions.data.length > 0 ? (
        <div>
          <p className="mb-1 font-medium text-ink-secondary">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.data.slice(0, 8).map((s) => (
              <button
                key={`${s.type}-${s.id ?? s.label}`}
                type="button"
                className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-surface-muted"
                onClick={() => {
                  if (s.type === 'BRAND' && s.id) {
                    onApplyFilters({ brandId: s.id, q: undefined });
                  } else if (s.type === 'CITY' && s.id) {
                    onApplyFilters({
                      cityId: s.id,
                      governorateId:
                        typeof s.meta?.governorateId === 'string'
                          ? s.meta.governorateId
                          : undefined,
                    });
                  } else if (s.type === 'MODEL' && s.id) {
                    onApplyFilters({
                      modelId: s.id,
                      brandId:
                        typeof s.meta?.brandId === 'string'
                          ? s.meta.brandId
                          : undefined,
                    });
                  } else {
                    onApplyKeyword(s.label);
                  }
                }}
              >
                {s.label}
                <span className="ml-1 text-ink-secondary">({s.type})</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {authed && recent.data && recent.data.length > 0 ? (
        <div>
          <p className="mb-1 font-medium text-ink-secondary">Recent</p>
          <div className="flex flex-wrap gap-2">
            {recent.data.slice(0, 6).map((r) => (
              <button
                key={r.id}
                type="button"
                className="rounded-lg bg-surface-muted px-2 py-1 text-xs"
                onClick={() => {
                  if (r.keyword) onApplyKeyword(r.keyword);
                  onApplyFilters({
                    brandId: r.brandId ?? undefined,
                    modelId: r.modelId ?? undefined,
                    cityId: r.cityId ?? undefined,
                    governorateId: r.governorateId ?? undefined,
                  });
                }}
              >
                {r.keyword || 'Filters'}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {authed ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={save.isPending}
            onClick={onSave}
          >
            Save search
          </Button>
          {saved.data?.slice(0, 4).map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1 text-xs">
              <button
                type="button"
                className="rounded-lg border border-border px-2 py-1 hover:bg-surface-muted"
                onClick={() => {
                  const f = s.filters as Partial<MarketplaceSearchQuery>;
                  onApplyFilters({
                    ...f,
                    q: s.query ?? f.q,
                    sort: (s.sort as SearchSort) || 'NEWEST',
                  });
                }}
              >
                {s.name || s.query || 'Saved'}
              </button>
              <button
                type="button"
                className="text-ink-secondary hover:text-error"
                aria-label="Delete saved search"
                onClick={() => remove.mutate(s.id)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-secondary">
          Sign in to save searches and see recent history.
        </p>
      )}
    </div>
  );
}
