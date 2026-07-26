import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { MarketplaceCard } from '@/src/types/marketplace';

export type FavoritePendingOp = {
  id: string;
  action: 'add' | 'remove';
  item?: MarketplaceCard;
  queuedAt: string;
};

type FavoritesState = {
  items: MarketplaceCard[];
  pendingOps: FavoritePendingOp[];
  hydrated: boolean;
  lastSyncedAt: string | null;
  setHydrated: (value: boolean) => void;
  isFavorite: (id: string) => boolean;
  toggle: (item: MarketplaceCard) => void;
  remove: (id: string) => void;
  clear: () => void;
  /** Apply queued offline toggles after reconnect (local cache; no favorites API yet). */
  flushPending: () => number;
  markSynced: () => void;
};

function enqueue(
  pendingOps: FavoritePendingOp[],
  op: FavoritePendingOp,
): FavoritePendingOp[] {
  const without = pendingOps.filter((p) => p.id !== op.id);
  return [...without, op].slice(-100);
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      pendingOps: [],
      hydrated: false,
      lastSyncedAt: null,
      setHydrated: (value) => set({ hydrated: value }),
      isFavorite: (id) => get().items.some((x) => x.id === id),
      toggle: (item) =>
        set((state) => {
          const exists = state.items.some((x) => x.id === item.id);
          const nextItems = exists
            ? state.items.filter((x) => x.id !== item.id)
            : [{ ...item }, ...state.items].slice(0, 200);
          const op: FavoritePendingOp = {
            id: item.id,
            action: exists ? 'remove' : 'add',
            item: exists ? undefined : item,
            queuedAt: new Date().toISOString(),
          };
          return {
            items: nextItems,
            pendingOps: enqueue(state.pendingOps, op),
          };
        }),
      remove: (id) =>
        set((state) => ({
          items: state.items.filter((x) => x.id !== id),
          pendingOps: enqueue(state.pendingOps, {
            id,
            action: 'remove',
            queuedAt: new Date().toISOString(),
          }),
        })),
      clear: () => set({ items: [], pendingOps: [] }),
      flushPending: () => {
        const ops = get().pendingOps;
        if (ops.length === 0) {
          get().markSynced();
          return 0;
        }
        // Local-only marketplace: replaying ops is a no-op against server.
        // Clear queue and stamp sync time so reconnect UX is complete.
        set({ pendingOps: [], lastSyncedAt: new Date().toISOString() });
        return ops.length;
      },
      markSynced: () => set({ lastSyncedAt: new Date().toISOString(), pendingOps: [] }),
    }),
    {
      name: 'autohub.favorites.v1',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        items: state.items,
        pendingOps: state.pendingOps,
        lastSyncedAt: state.lastSyncedAt,
      }),
    },
  ),
);
