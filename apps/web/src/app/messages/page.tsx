'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, EmptyState, Skeleton } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { createChatRepository } from '@/features/chat/data/chat.repository';
import { getHttpClient } from '@/lib/api/client';

function peerLabel(peers?: { displayName: string | null }[]) {
  if (!peers?.length) return 'Conversation';
  return peers.map((p) => p.displayName ?? 'User').join(', ');
}

export default function MessagesInboxPage() {
  const router = useRouter();
  const { status } = useAuth();
  const query = useQuery({
    queryKey: ['conversations-inbox'],
    enabled: status === 'authenticated',
    queryFn: () => createChatRepository(getHttpClient()).getInbox({ page: 1, pageSize: 30 }),
    refetchInterval: 15_000,
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login?next=/messages');
  }, [status, router]);

  if (status === 'bootstrapping') {
    return (
      <div className="page-container py-10">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="page-container py-10">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  const items = query.data?.items ?? [];
  const totalUnread = query.data?.totalUnread ?? 0;

  return (
    <div className="page-container py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title">Messages</h1>
          <p className="mt-1 text-ink-secondary">
            {totalUnread > 0 ? `${totalUnread} unread` : 'Your conversations'}
          </p>
        </div>
        <Button variant="secondary" onClick={() => void query.refetch()}>
          Refresh
        </Button>
      </div>

      {query.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <EmptyState
          title="Couldn’t load messages"
          description={query.error instanceof Error ? query.error.message : 'Try again'}
          action={
            <Button variant="secondary" onClick={() => void query.refetch()}>
              Retry
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="Message a seller from a listing to start chatting."
          action={
            <Link href="/search">
              <Button>Browse listings</Button>
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
          {items.map((c) => (
            <li key={c.id}>
              <Link
                href={`/messages/${c.id}`}
                className="flex items-start justify-between gap-3 px-4 py-4 hover:bg-surface-muted"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{peerLabel(c.peers)}</p>
                  <p className="mt-0.5 truncate text-sm text-ink-secondary">
                    {c.lastMessagePreview ?? 'No messages yet'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {c.unreadCount > 0 ? (
                    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">
                      {c.unreadCount}
                    </span>
                  ) : null}
                  <p className="mt-1 text-xs text-ink-secondary">
                    {c.lastMessageAt
                      ? new Date(c.lastMessageAt).toLocaleString()
                      : ''}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
