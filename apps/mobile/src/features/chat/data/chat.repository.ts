import type { HttpClient } from '@/lib/api/http-client';
import { toQueryString } from '@/src/lib/query';
import type {
  ChatMessage,
  ChatMessageType,
  ConversationSummary,
  InboxPage,
  MessagesPage,
} from '../domain/types';

export type InboxQuery = {
  q?: string;
  unreadOnly?: boolean;
  archived?: boolean;
  page?: number;
  pageSize?: number;
};

export type SendMessageInput = {
  type: ChatMessageType;
  body?: string;
  payload?: Record<string, unknown>;
  clientId?: string;
};

export type ChatRepository = {
  getInbox(query: InboxQuery): Promise<InboxPage>;
  getConversation(id: string): Promise<ConversationSummary & { peers?: ConversationSummary['peer'][] }>;
  getMessages(id: string, page?: number, pageSize?: number): Promise<MessagesPage>;
  startListingChat(
    listingId: string,
    firstMessage?: SendMessageInput,
  ): Promise<ConversationSummary>;
  startDealerChat(
    organizationId: string,
    firstMessage?: SendMessageInput,
  ): Promise<ConversationSummary>;
  sendMessage(conversationId: string, input: SendMessageInput): Promise<ChatMessage>;
  markRead(conversationId: string): Promise<void>;
  markDelivered(conversationId: string): Promise<void>;
  typing(conversationId: string, isTyping: boolean): Promise<void>;
  updateConversation(
    id: string,
    body: {
      archive?: boolean;
      unarchive?: boolean;
      mute?: boolean;
      mutedUntil?: string;
      unmute?: boolean;
      hide?: boolean;
    },
  ): Promise<void>;
  report(id: string, reason: string, details?: string): Promise<void>;
  blockUser(userId: string, reason?: string): Promise<void>;
  unblockUser(userId: string): Promise<void>;
  followDealer(organizationId: string): Promise<void>;
  unfollowDealer(organizationId: string): Promise<void>;
  isFollowingDealer(organizationId: string): Promise<{ following: boolean }>;
};

export function createChatRepository(http: HttpClient): ChatRepository {
  return {
    getInbox: (query) =>
      http.get<InboxPage>(
        `/v1/conversations${toQueryString({
          q: query.q,
          unreadOnly: query.unreadOnly,
          archived: query.archived,
          page: query.page ?? 1,
          pageSize: query.pageSize ?? 20,
        })}`,
        true,
      ),

    getConversation: (id) => http.get(`/v1/conversations/${id}`, true),

    getMessages: (id, page = 1, pageSize = 40) =>
      http.get<MessagesPage>(
        `/v1/conversations/${id}/messages${toQueryString({ page, pageSize })}`,
        true,
      ),

    startListingChat: (listingId, firstMessage) =>
      http.post('/v1/conversations/listing', { listingId, firstMessage }, true),

    startDealerChat: (organizationId, firstMessage) =>
      http.post('/v1/conversations/dealer', { organizationId, firstMessage }, true),

    sendMessage: (conversationId, input) =>
      http.post(`/v1/conversations/${conversationId}/messages`, input, true),

    markRead: async (conversationId) => {
      await http.post(`/v1/conversations/${conversationId}/read`, {}, true);
    },

    markDelivered: async (conversationId) => {
      await http.post(`/v1/conversations/${conversationId}/delivered`, {}, true);
    },

    typing: async (conversationId, isTyping) => {
      await http.post(`/v1/conversations/${conversationId}/typing`, { isTyping }, true);
    },

    updateConversation: async (id, body) => {
      await http.request(`/v1/conversations/${id}`, { method: 'PATCH', body });
    },

    report: async (id, reason, details) => {
      await http.post(`/v1/conversations/${id}/report`, { reason, details }, true);
    },

    blockUser: async (userId, reason) => {
      await http.post(`/v1/users/${userId}/block`, { reason }, true);
    },

    unblockUser: async (userId) => {
      await http.request(`/v1/users/${userId}/block`, { method: 'DELETE' });
    },

    followDealer: async (organizationId) => {
      await http.post(`/v1/dealers/${organizationId}/follow`, {}, true);
    },

    unfollowDealer: async (organizationId) => {
      await http.request(`/v1/dealers/${organizationId}/follow`, { method: 'DELETE' });
    },

    isFollowingDealer: (organizationId) =>
      http.get<{ following: boolean }>(`/v1/dealers/${organizationId}/follow`, true),
  };
}
