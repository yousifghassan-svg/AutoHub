'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type SearchContextValue = {
  query: string;
  setQuery: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  enabled: boolean;
};

const SearchContext = createContext<SearchContextValue | null>(null);

const SEARCH_PATHS = ['/listings', '/users', '/plates', '/dealers', '/audit-logs', '/media'];

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const enabled = SEARCH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const [query, setQueryState] = useState('');

  useEffect(() => {
    if (enabled) {
      setQueryState(searchParams.get('q') ?? '');
    } else {
      setQueryState('');
    }
  }, [enabled, searchParams]);

  const setQuery = useCallback(
    (value: string) => {
      setQueryState(value);
      if (!enabled) return;
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set('q', value);
      else params.delete('q');
      params.delete('page');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [enabled, pathname, router, searchParams],
  );

  const value = useMemo(
    () => ({ query, setQuery, inputRef, enabled }),
    [query, setQuery, enabled],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}
