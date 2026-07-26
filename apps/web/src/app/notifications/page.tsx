'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, EmptyState, Skeleton } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { createNotificationsRepository } from '@/features/notifications/data/notifications.repository';
import { getHttpClient } from '@/lib/api/client';

function destinationFor(data?: Record<string, unknown> | null): string | null {
  const listingId = data?.listingId;
  if (typeof listingId === 'string' && listingId) return `/listings/${listingId}`;
  const conversationId = data?.conversationId;
  if (typeof conversationId === 'string' && conversationId) {
    return `/messages/${conversationId}`;
  }
  return null;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { status } = useAuth();
  const qc = useQueryClient();
  const repo = createNotificationsRepository(getHttpClient());

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login?next=/notifications');
  }, [status, router]);

  const query = useQuery({
    queryKey: ['notifications'],
    enabled: status === 'authenticated',
    queryFn: () => repo.list(1, 40),
    refetchInterval: 20_000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => repo.markRead(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAll = useMutation({
    mutationFn: () => repo.markAllRead(),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (status === 'bootstrapping' || status === 'unauthenticated') {
    return (
      <div className="page-container py-10">
        <Skeleton className="h-10 w-56" />
      </div>
    );
  }

  const items = query.data?.items ?? [];
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <div className="page-container py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title">Notifications</h1>
          <p className="mt-1 text-ink-secondary">
            {unread > 0 ? `${unread} unread` : 'You’re all caught up'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={markAll.isPending || unread === 0}
            onClick={() => void markAll.mutateAsync()}
          >
            Mark all read
          </Button>
          <Button variant="ghost" onClick={() => void query.refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      {query.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <EmptyState
          title="Couldn’t load notifications"
          description={query.error instanceof Error ? query.error.message : 'Try again'}
          action={
            <Button variant="secondary" onClick={() => void query.refetch()}>
              Retry
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="Listing updates and messages will show up here."
        />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
          {items.map((n) => {
            const unreadItem = !n.readAt;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  className={`flex w-full flex-col gap-1 px-4 py-4 text-left hover:bg-surface-muted ${
                    unreadItem ? 'bg-brand-soft/40' : ''
                  }`}
                  onClick={() => {
                    if (unreadItem) void markRead.mutateAsync(n.id);
                    const href = destinationFor(n.data);
                    if (href) router.push(href);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-ink">{n.title}</p>
                    {unreadItem ? (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />
                    ) : null}
                  </div>
                  <p className="text-sm text-ink-secondary">{n.body}</p>
                  <p className="text-xs text-ink-secondary">
                    {new Date(n.createdAt).toLocaleString()} · {n.type}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
