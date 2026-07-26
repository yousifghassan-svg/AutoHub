export type ChatMessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'LOCATION'
  | 'LISTING_CARD'
  | 'DEALER_CARD'
  | 'CONTACT_CARD'
  | 'SYSTEM';

export type ConversationSummary = {
  id: string;
  listingId: string | null;
  dealerOrganizationId: string | null;
  marketplaceDomain: 'VEHICLE' | 'PLATE' | null;
  status: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  archivedAt: string | null;
  mutedUntil: string | null;
  peers?: { userId: string; displayName: string | null }[];
  listing?: { id: string; slug?: string | null } | null;
  dealerOrganization?: { id: string; name: string } | null;
};

export type InboxPage = {
  page: number;
  pageSize: number;
  total: number;
  totalUnread: number;
  items: ConversationSummary[];
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string | null;
  sender?: { id: string; displayName: string | null } | null;
  type: ChatMessageType;
  body: string | null;
  payload?: unknown;
  clientId: string | null;
  status: string;
  createdAt: string;
};

export type MessagesPage = {
  page: number;
  pageSize: number;
  total: number;
  items: ChatMessage[];
};
