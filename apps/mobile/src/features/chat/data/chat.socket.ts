import { io, type Socket } from 'socket.io-client';
import { config } from '@/lib/config';
import { createSecureTokenStorage } from '@/features/auth/data/token-storage';

type Handlers = {
  onMessageNew?: (payload: unknown) => void;
  onMessageStatus?: (payload: unknown) => void;
  onTyping?: (payload: { conversationId: string; userId: string; isTyping: boolean }) => void;
  onPresence?: (payload: { userId: string; isOnline: boolean; lastSeenAt?: string }) => void;
  onConversationUpdated?: (payload: unknown) => void;
};

let socket: Socket | null = null;

export async function connectChatSocket(handlers: Handlers = {}): Promise<Socket | null> {
  const session = await createSecureTokenStorage().load();
  const token = session?.accessToken;
  if (!token) return null;

  if (socket?.connected) {
    attachHandlers(socket, handlers);
    return socket;
  }

  socket?.disconnect();
  socket = io(`${config.apiUrl}/chat`, {
    transports: ['websocket'],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 8,
  });

  attachHandlers(socket, handlers);
  return socket;
}

function attachHandlers(s: Socket, handlers: Handlers) {
  s.off('message:new');
  s.off('message:status');
  s.off('typing');
  s.off('presence:update');
  s.off('conversation:updated');

  if (handlers.onMessageNew) s.on('message:new', handlers.onMessageNew);
  if (handlers.onMessageStatus) s.on('message:status', handlers.onMessageStatus);
  if (handlers.onTyping) s.on('typing', handlers.onTyping);
  if (handlers.onPresence) s.on('presence:update', handlers.onPresence);
  if (handlers.onConversationUpdated) s.on('conversation:updated', handlers.onConversationUpdated);
}

export function joinConversationRoom(conversationId: string) {
  socket?.emit('join_conversation', { conversationId });
}

export function leaveConversationRoom(conversationId: string) {
  socket?.emit('leave_conversation', { conversationId });
}

export function emitTyping(conversationId: string, isTyping: boolean) {
  socket?.emit(isTyping ? 'typing_start' : 'typing_stop', { conversationId });
}

export function disconnectChatSocket() {
  socket?.disconnect();
  socket = null;
}

export function getChatSocket() {
  return socket;
}
