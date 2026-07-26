'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { createChatRepository } from '../data/chat.repository';
import { createNotificationsRepository } from '@/features/notifications/data/notifications.repository';
import { getHttpClient } from '@/lib/api/client';

export function useUnreadCounts() {
  const { status } = useAuth();
  const enabled = status === 'authenticated';

  const inbox = useQuery({
    queryKey: ['conversations-inbox', 'badge'],
    enabled,
    queryFn: () => createChatRepository(getHttpClient()).getInbox({ page: 1, pageSize: 1 }),
    refetchInterval: 30_000,
  });

  const notifications = useQuery({
    queryKey: ['notifications', 'badge'],
    enabled,
    queryFn: () => createNotificationsRepository(getHttpClient()).list(1, 20, true),
    refetchInterval: 30_000,
  });

  return {
    messagesUnread: inbox.data?.totalUnread ?? 0,
    notificationsUnread: notifications.data?.total ?? notifications.data?.items.length ?? 0,
  };
}
