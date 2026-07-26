import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getChatRepository } from '../di';
import { mapConversation, mapInbox, mapMessage, mapMessagesPage } from '../domain/mappers';
import type { InboxQuery, SendMessageInput } from '../data/chat.repository';
import { enqueue, loadQueue, removeFromQueue } from '../data/offline-queue';
import { isOnline } from '@/lib/network';

export const chatKeys = {
  all: ['chat'] as const,
  inbox: (q: InboxQuery) => [...chatKeys.all, 'inbox', q] as const,
  conversation: (id: string) => [...chatKeys.all, 'conversation', id] as const,
  messages: (id: string) => [...chatKeys.all, 'messages', id] as const,
};

export function useInboxInfinite(query: InboxQuery) {
  return useInfiniteQuery({
    queryKey: chatKeys.inbox(query),
    queryFn: async ({ pageParam }) => {
      const page = await getChatRepository().getInbox({ ...query, page: pageParam });
      return mapInbox(page as never);
    },
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: chatKeys.conversation(id),
    queryFn: async () => mapConversation((await getChatRepository().getConversation(id)) as never),
    enabled: Boolean(id),
  });
}

export function useMessagesInfinite(conversationId: string) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: async ({ pageParam }) => {
      const page = await getChatRepository().getMessages(conversationId, pageParam, 40);
      return mapMessagesPage(page as never);
    },
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    enabled: Boolean(conversationId),
  });
}

export function useStartListingChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { listingId: string; firstMessage?: SendMessageInput }) => {
      const raw = await getChatRepository().startListingChat(input.listingId, input.firstMessage);
      return mapConversation(raw as never);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

export function useStartDealerChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { organizationId: string; firstMessage?: SendMessageInput }) => {
      const raw = await getChatRepository().startDealerChat(
        input.organizationId,
        input.firstMessage,
      );
      return mapConversation(raw as never);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SendMessageInput) => {
      const clientId =
        input.clientId ?? `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      const payload = { ...input, clientId };
      const online = await isOnline();
      if (!online) {
        await enqueue({ conversationId, ...payload, queuedAt: new Date().toISOString() });
        return mapMessage({
          id: clientId,
          conversationId,
          senderId: null,
          type: payload.type,
          body: payload.body ?? null,
          payload: payload.payload ?? null,
          clientId,
          status: 'FAILED',
          createdAt: new Date().toISOString(),
        });
      }
      try {
        const msg = await getChatRepository().sendMessage(conversationId, payload);
        await removeFromQueue(clientId);
        return mapMessage(msg as never);
      } catch (e) {
        await enqueue({ conversationId, ...payload, queuedAt: new Date().toISOString() });
        throw e;
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
      void qc.invalidateQueries({ queryKey: chatKeys.inbox({}) });
    },
  });
}

export function useFlushOfflineQueue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const online = await isOnline();
      if (!online) return 0;
      const queue = await loadQueue();
      let sent = 0;
      for (const item of queue) {
        try {
          await getChatRepository().sendMessage(item.conversationId, item);
          if (item.clientId) await removeFromQueue(item.clientId);
          sent += 1;
        } catch {
          // keep in queue
        }
      }
      return sent;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

export function useConversationActions(conversationId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: chatKeys.all });
  };
  const repo = getChatRepository();
  return {
    markRead: () => repo.markRead(conversationId).then(invalidate),
    archive: () => repo.updateConversation(conversationId, { archive: true }).then(invalidate),
    unarchive: () =>
      repo.updateConversation(conversationId, { unarchive: true }).then(invalidate),
    mute: (hours = 24) =>
      repo
        .updateConversation(conversationId, {
          mutedUntil: new Date(Date.now() + hours * 3600_000).toISOString(),
        })
        .then(invalidate),
    unmute: () => repo.updateConversation(conversationId, { unmute: true }).then(invalidate),
    hide: () => repo.updateConversation(conversationId, { hide: true }).then(invalidate),
    report: (reason: string, details?: string) =>
      repo.report(conversationId, reason, details).then(invalidate),
  };
}
