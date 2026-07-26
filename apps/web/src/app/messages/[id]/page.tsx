'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, EmptyState, Input, Skeleton } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { createChatRepository } from '@/features/chat/data/chat.repository';
import { getHttpClient } from '@/lib/api/client';

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { status, session } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const repo = createChatRepository(getHttpClient());

  useEffect(() => {
    if (status === 'unauthenticated') router.replace(`/login?next=/messages/${id}`);
  }, [status, router, id]);

  const conversation = useQuery({
    queryKey: ['conversation', id],
    enabled: status === 'authenticated' && Boolean(id),
    queryFn: () => repo.getConversation(id),
  });

  const messages = useQuery({
    queryKey: ['conversation-messages', id],
    enabled: status === 'authenticated' && Boolean(id),
    queryFn: () => repo.getMessages(id, 1, 50),
    refetchInterval: 5_000,
  });

  useEffect(() => {
    if (status !== 'authenticated' || !id) return;
    void repo.markRead(id).then(() => {
      void qc.invalidateQueries({ queryKey: ['conversations-inbox'] });
      void qc.invalidateQueries({ queryKey: ['conversation', id] });
    });
  }, [status, id, qc]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.data?.items.length]);

  const send = useMutation({
    mutationFn: async () => {
      const body = text.trim();
      if (!body) throw new Error('Message cannot be empty');
      return repo.sendMessage(id, {
        type: 'TEXT',
        body,
        clientId: `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      });
    },
    onSuccess: async () => {
      setText('');
      setSendError(null);
      await qc.invalidateQueries({ queryKey: ['conversation-messages', id] });
      await qc.invalidateQueries({ queryKey: ['conversations-inbox'] });
    },
    onError: (err) => {
      setSendError(err instanceof Error ? err.message : 'Failed to send');
    },
  });

  if (status === 'bootstrapping' || status === 'unauthenticated') {
    return (
      <div className="page-container py-10">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  const items = [...(messages.data?.items ?? [])].reverse();
  const myId = session?.user.id;

  return (
    <div className="page-container flex min-h-[70vh] flex-col py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <Link href="/messages" className="text-sm font-semibold text-brand">
            ← Inbox
          </Link>
          <h1 className="mt-1 font-display text-xl font-bold text-ink">
            {conversation.data?.peers?.map((p) => p.displayName ?? 'User').join(', ') ??
              'Conversation'}
          </h1>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void messages.refetch()}>
          Refresh
        </Button>
      </div>

      <div className="flex flex-1 flex-col rounded-xl border border-border bg-surface">
        <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: '55vh' }}>
          {messages.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : messages.isError ? (
            <EmptyState
              title="Couldn’t load messages"
              description={
                messages.error instanceof Error ? messages.error.message : 'Try again'
              }
            />
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-secondary">
              No messages yet. Say hello.
            </p>
          ) : (
            items.map((m) => {
              const mine = m.senderId === myId;
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      mine
                        ? 'bg-brand text-white'
                        : 'bg-surface-muted text-ink'
                    }`}
                  >
                    {!mine && m.sender?.displayName ? (
                      <p className="mb-0.5 text-xs opacity-80">{m.sender.displayName}</p>
                    ) : null}
                    <p className="whitespace-pre-wrap">{m.body ?? `[${m.type}]`}</p>
                    <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-ink-secondary'}`}>
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form
          className="flex flex-col gap-2 border-t border-border p-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void send.mutateAsync();
          }}
        >
          <Input
            label="Message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1"
          />
          <Button type="submit" disabled={send.isPending || !text.trim()} className="sm:mb-0.5">
            {send.isPending ? 'Sending…' : 'Send'}
          </Button>
        </form>
        {sendError ? <p className="px-3 pb-3 text-sm text-error">{sendError}</p> : null}
      </div>
    </div>
  );
}
