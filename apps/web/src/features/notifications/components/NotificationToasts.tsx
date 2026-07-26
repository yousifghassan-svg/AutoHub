'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { createNotificationsRepository } from '../data/notifications.repository';
import { getHttpClient } from '@/lib/api/client';

/** Polls unread notifications and surfaces new ones as toasts. */
export function NotificationToasts() {
  const { status } = useAuth();
  const { toast } = useToast();
  const seen = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  const query = useQuery({
    queryKey: ['notifications', 'toast-poll'],
    enabled: status === 'authenticated',
    queryFn: () => createNotificationsRepository(getHttpClient()).list(1, 10, true),
    refetchInterval: 20_000,
  });

  useEffect(() => {
    const items = query.data?.items ?? [];
    if (!items.length) return;

    if (!primed.current) {
      for (const n of items) seen.current.add(n.id);
      primed.current = true;
      return;
    }

    for (const n of items) {
      if (seen.current.has(n.id)) continue;
      seen.current.add(n.id);
      toast({ title: n.title, body: n.body, tone: 'info' });
    }
  }, [query.data, toast]);

  return null;
}
