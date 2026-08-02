'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  parseVehicleSearchParams,
  patchVehicleSearchState,
  serializeVehicleSearchParams,
  vehicleSearchQueryEqual,
  type VehicleSearchUrlState,
} from '@/features/search/lib/url-search-state';

type WriteOptions = {
  resetPage?: boolean;
  /** push = Back/Forward history; replace = silent (e.g. page hydration). */
  history?: 'push' | 'replace';
  /** Coalesce rapid writes (range sliders). */
  debounceMs?: number;
};

/**
 * URL is the single source of truth for vehicle search filters.
 * Keyword input keeps a local draft until submit; all other fields
 * read/write the query string directly (Back/Forward/refresh safe).
 */
export function useVehicleSearchUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryKey = searchParams.toString();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const state = useMemo(
    () => parseVehicleSearchParams(new URLSearchParams(queryKey)),
    [queryKey],
  );

  const [keywordDraft, setKeywordDraft] = useState(state.q);

  useEffect(() => {
    setKeywordDraft(state.q);
  }, [state.q]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const writeState = useCallback(
    (patch: Partial<VehicleSearchUrlState>, options?: WriteOptions) => {
      const run = () => {
        const next = patchVehicleSearchState(state, patch, {
          resetPage: options?.resetPage,
        });
        const qs = serializeVehicleSearchParams(next).toString();
        if (vehicleSearchQueryEqual(qs, queryKey)) return;
        const href = qs ? `${pathname}?${qs}` : pathname;
        const mode = options?.history ?? 'push';
        if (mode === 'replace') {
          router.replace(href, { scroll: false });
        } else {
          router.push(href, { scroll: false });
        }
      };

      if (options?.debounceMs && options.debounceMs > 0) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(run, options.debounceMs);
        return;
      }
      run();
    },
    [state, queryKey, pathname, router],
  );

  const submitKeyword = useCallback(() => {
    writeState({ q: keywordDraft.trim() });
  }, [keywordDraft, writeState]);

  return {
    state,
    keywordDraft,
    setKeywordDraft,
    submitKeyword,
    writeState,
  };
}
