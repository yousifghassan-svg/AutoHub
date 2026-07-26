export type ChatMessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'LOCATION'
  | 'LISTING_CARD'
  | 'DEALER_CARD'
  | 'CONTACT_CARD'
  | 'SYSTEM';

export type ChatMessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string | null;
  type: ChatMessageType;
  body: string | null;
  payload: Record<string, unknown> | null;
  clientId: string | null;
  status: ChatMessageStatus;
  flagged?: boolean;
  createdAt: string;
  /** Local-only optimistic / offline */
  localStatus?: 'queued' | 'sending' | 'failed' | 'synced';
};

export type ConversationPeer = {
  id: string;
  displayName: string | null;
  isOnline?: boolean;
  lastSeenAt?: string | null;
};

export type ConversationSummary = {
  id: string;
  listingId: string | null;
  dealerOrganizationId: string | null;
  marketplaceDomain: 'VEHICLE' | 'PLATE' | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  mutedUntil: string | null;
  archivedAt: string | null;
  peer: ConversationPeer | null;
  listingTitle?: string | null;
  listingImageUrl?: string | null;
  dealerName?: string | null;
};

export type InboxPage = {
  items: ConversationSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  totalUnread: number;
};

export type MessagesPage = {
  items: ChatMessage[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
