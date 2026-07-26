import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthProvider';
import { getManageRepository } from '@/src/features/manage/di';
import {
  pushListingNotification,
  statusChangeMessage,
  type ListingNotifyStatus,
} from './listing-notifications.store';

/**
 * Polls mine listings and emits local notifications when status changes.
 * No push backend registry yet — in-app inbox only.
 */
export function StatusChangeWatcher() {
  const { session } = useAuth();
  const seen = useRef<Map<string, string>>(new Map());
  const primed = useRef(false);

  const query = useQuery({
    queryKey: ['manage', 'status-watch'],
    enabled: Boolean(session?.accessToken),
    refetchInterval: 60_000,
    queryFn: async () => {
      const repo = getManageRepository();
      const [vehicles, plates] = await Promise.all([
        repo.listMine({ domain: 'VEHICLE', tab: 'ALL', page: 1, pageSize: 50 }),
        repo.listMine({ domain: 'PLATE', tab: 'ALL', page: 1, pageSize: 50 }),
      ]);
      return [...vehicles.items, ...plates.items];
    },
  });

  useEffect(() => {
    const items = query.data;
    if (!items) return;

    if (!primed.current) {
      for (const item of items) {
        seen.current.set(item.id, item.status);
      }
      primed.current = true;
      return;
    }

    for (const item of items) {
      const prev = seen.current.get(item.id);
      if (prev && prev !== item.status) {
        const notifyStatuses: ListingNotifyStatus[] = [
          'PENDING',
          'ACTIVE',
          'REJECTED',
          'SOLD',
          'EXPIRED',
          'ARCHIVED',
        ];
        if (notifyStatuses.includes(item.status as ListingNotifyStatus)) {
          pushListingNotification({
            listingId: item.id,
            domain: item.domain,
            title: item.title,
            status: item.status as ListingNotifyStatus,
            message: statusChangeMessage(item.status as ListingNotifyStatus),
          });
        }
      }
      seen.current.set(item.id, item.status);
    }
  }, [query.data]);

  return null;
}
