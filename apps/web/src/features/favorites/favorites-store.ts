'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

const KEY = 'autohub.web.favorites';

/** Stable empty snapshot for SSR / pre-hydration — never allocate a new []. */
const EMPTY_IDS: readonly string[] = Object.freeze([]);

type Listener = () => void;
const listeners = new Set<Listener>();

/** Until true, getSnapshot must match getServerSnapshot to avoid hydration errors. */
let clientReady = false;

let cachedRaw: string | null | undefined = undefined;
let cachedSnapshot: readonly string[] = EMPTY_IDS;

function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function readFromStorage(): readonly string[] {
  if (typeof window === 'undefined') return EMPTY_IDS;

  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedSnapshot;

    cachedRaw = raw;

    if (!raw) {
      cachedSnapshot = EMPTY_IDS;
      return cachedSnapshot;
    }

    const parsed = JSON.parse(raw) as unknown;
    const next = Array.isArray(parsed)
      ? (parsed.filter((x) => typeof x === 'string') as string[])
      : [];

    if (next.length === 0) {
      cachedSnapshot = EMPTY_IDS;
      return cachedSnapshot;
    }

    if (arraysEqual(cachedSnapshot, next)) {
      return cachedSnapshot;
    }

    cachedSnapshot = Object.freeze([...next]);
    return cachedSnapshot;
  } catch {
    cachedRaw = null;
    cachedSnapshot = EMPTY_IDS;
    return EMPTY_IDS;
  }
}

/**
 * Client snapshot. Before mount, returns EMPTY_IDS so it matches getServerSnapshot
 * during hydration (localStorage is not available on the server).
 */
function getSnapshot(): readonly string[] {
  if (!clientReady) return EMPTY_IDS;
  return readFromStorage();
}

function getServerSnapshot(): readonly string[] {
  return EMPTY_IDS;
}

function markClientReady() {
  if (clientReady) return;
  clientReady = true;
  cachedRaw = undefined;
  listeners.forEach((listener) => listener());
}

function writeIds(ids: string[]) {
  const current = readFromStorage();
  if (arraysEqual(current, ids)) return;

  const next = ids.length === 0 ? EMPTY_IDS : Object.freeze([...ids]);
  const serialized = JSON.stringify([...next]);
  localStorage.setItem(KEY, serialized);
  cachedRaw = serialized;
  cachedSnapshot = next;
  if (clientReady) {
    listeners.forEach((listener) => listener());
  }
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useFavoriteIds(): readonly string[] {
  useEffect(() => {
    markClientReady();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useFavorites() {
  const ids = useFavoriteIds();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((id: string) => {
    const current = readFromStorage();
    if (current.includes(id)) {
      writeIds(current.filter((x) => x !== id));
    } else {
      writeIds([id, ...current]);
    }
  }, []);

  const remove = useCallback((id: string) => {
    writeIds(readFromStorage().filter((x) => x !== id));
  }, []);

  return { ids, isFavorite, toggle, remove, hydrated };
}
