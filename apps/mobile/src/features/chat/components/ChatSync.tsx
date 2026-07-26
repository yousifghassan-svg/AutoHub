import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthProvider';
import { isOnline } from '@/lib/network';
import { connectChatSocket, disconnectChatSocket } from '../data/chat.socket';
import { getChatRepository } from '../di';
import { loadQueue, removeFromQueue } from '../data/offline-queue';
import { chatKeys } from '../hooks/useChat';

/** Maintains socket connection, presence, and offline message flush. */
export function ChatSync() {
  const { session } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!session?.accessToken) {
      disconnectChatSocket();
      return;
    }

    let cancelled = false;
    void connectChatSocket({
      onMessageNew: () => {
        void qc.invalidateQueries({ queryKey: chatKeys.all });
      },
      onMessageStatus: () => {
        void qc.invalidateQueries({ queryKey: chatKeys.all });
      },
      onConversationUpdated: () => {
        void qc.invalidateQueries({ queryKey: chatKeys.all });
      },
    });

    const flushQueue = async () => {
      if (cancelled || !(await isOnline())) return;
      const queue = await loadQueue();
      for (const item of queue) {
        try {
          await getChatRepository().sendMessage(item.conversationId, item);
          if (item.clientId) await removeFromQueue(item.clientId);
        } catch {
          // keep queued
        }
      }
      if (queue.length) void qc.invalidateQueries({ queryKey: chatKeys.all });
    };

    void flushQueue();
    const id = setInterval(() => void flushQueue(), 8000);

    return () => {
      cancelled = true;
      clearInterval(id);
      disconnectChatSocket();
    };
  }, [session?.accessToken, qc]);

  return null;
}
