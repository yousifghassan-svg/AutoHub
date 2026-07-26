import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { MarketplaceDomain } from '@/src/types/marketplace';

export type ListingNotifyStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'REJECTED'
  | 'SOLD'
  | 'EXPIRED'
  | 'ARCHIVED'
  | 'DRAFT';

export type ListingNotification = {
  id: string;
  listingId: string;
  domain: MarketplaceDomain;
  title: string;
  status: ListingNotifyStatus;
  message: string;
  createdAt: string;
  read: boolean;
};

type State = {
  items: ListingNotification[];
  push: (input: Omit<ListingNotification, 'id' | 'createdAt' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
};

export const useListingNotificationsStore = create<State>()(
  persist(
    (set) => ({
      items: [],
      push: (input) =>
        set((state) => ({
          items: [
            {
              ...input,
              id: `ln_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
              createdAt: new Date().toISOString(),
              read: false,
            },
            ...state.items,
          ].slice(0, 100),
        })),
      markRead: (id) =>
        set((state) => ({
          items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllRead: () =>
        set((state) => ({ items: state.items.map((n) => ({ ...n, read: true })) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'autohub.listing-notifications.v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function pushListingNotification(
  input: Omit<ListingNotification, 'id' | 'createdAt' | 'read'>,
) {
  useListingNotificationsStore.getState().push(input);
}

export function statusChangeMessage(status: ListingNotifyStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Listing is pending review.';
    case 'ACTIVE':
      return 'Listing was approved and is now published.';
    case 'REJECTED':
      return 'Listing was rejected. Edit and resubmit.';
    case 'SOLD':
      return 'Listing marked as sold.';
    case 'EXPIRED':
      return 'Listing expired.';
    case 'ARCHIVED':
      return 'Listing was archived / paused.';
    case 'DRAFT':
      return 'Listing returned to draft.';
    default:
      return 'Listing status changed.';
  }
}
