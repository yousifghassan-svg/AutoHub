import type { HttpClient } from '@/lib/api/http-client';
import type {
  ChatMessage,
  ConversationSummary,
  InboxPage,
  MessagesPage,
} from '../domain/types';

function qs(params: Record<string, string | number | boolean | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === '') continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export type SendMessageInput = {
  type: 'TEXT' | 'IMAGE' | 'LOCATION' | 'LISTING_CARD' | 'DEALER_CARD' | 'CONTACT_CARD' | 'SYSTEM';
  body?: string;
  payload?: Record<string, unknown>;
  clientId?: string;
};

export type ChatRepository = {
  getInbox(query?: {
    q?: string;
    unreadOnly?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<InboxPage>;
  getConversation(id: string): Promise<ConversationSummary>;
  getMessages(id: string, page?: number, pageSize?: number): Promise<MessagesPage>;
  startListingChat(listingId: string, firstMessage?: SendMessageInput): Promise<ConversationSummary>;
  sendMessage(conversationId: string, input: SendMessageInput): Promise<ChatMessage>;
  markRead(conversationId: string): Promise<void>;
};

export function createChatRepository(http: HttpClient): ChatRepository {
  return {
    getInbox: (query = {}) =>
      http.get<InboxPage>(
        `/v1/conversations${qs({
          q: query.q,
          unreadOnly: query.unreadOnly,
          page: query.page ?? 1,
          pageSize: query.pageSize ?? 20,
        })}`,
      ),
    getConversation: (id) => http.get<ConversationSummary>(`/v1/conversations/${id}`),
    getMessages: (id, page = 1, pageSize = 40) =>
      http.get<MessagesPage>(
        `/v1/conversations/${id}/messages${qs({ page, pageSize })}`,
      ),
    startListingChat: (listingId, firstMessage) =>
      http.post<ConversationSummary>('/v1/conversations/listing', {
        listingId,
        firstMessage,
      }),
    sendMessage: (conversationId, input) =>
      http.post<ChatMessage>(`/v1/conversations/${conversationId}/messages`, input),
    markRead: async (conversationId) => {
      await http.post(`/v1/conversations/${conversationId}/read`, {});
    },
  };
}
