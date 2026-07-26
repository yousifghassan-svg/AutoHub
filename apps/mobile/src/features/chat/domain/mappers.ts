import { mediaPublicUrl } from '@/lib/media/url';
import type { ChatMessage, ConversationSummary, InboxPage, MessagesPage } from './types';

type ApiConversation = {
  id: string;
  listingId: string | null;
  dealerOrganizationId: string | null;
  marketplaceDomain: 'VEHICLE' | 'PLATE' | null;
  lastMessageAt: string | Date | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  mutedUntil: string | Date | null;
  archivedAt: string | Date | null;
  peers?: Array<{ userId: string; displayName: string | null }>;
  listing?: {
    id: string;
    slug?: string;
    translations?: Array<{ language: string; title: string }>;
    media?: Array<{ r2Key: string; thumbnailKey: string | null; sortOrder: number }>;
  } | null;
  dealerOrganization?: { id: string; name: string } | null;
  peerPresence?: Array<{ userId: string; isOnline: boolean; lastSeenAt: string | null }>;
};

function iso(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.toISOString();
}

export function mapConversation(raw: ApiConversation): ConversationSummary {
  const peer = raw.peers?.[0];
  const presence = raw.peerPresence?.find((p) => p.userId === peer?.userId);
  const title =
    raw.listing?.translations?.[0]?.title ??
    raw.listing?.slug ??
    null;
  const media = [...(raw.listing?.media ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)[0];
  const key = media?.thumbnailKey ?? media?.r2Key ?? null;

  return {
    id: raw.id,
    listingId: raw.listingId,
    dealerOrganizationId: raw.dealerOrganizationId,
    marketplaceDomain: raw.marketplaceDomain,
    lastMessageAt: iso(raw.lastMessageAt),
    lastMessagePreview: raw.lastMessagePreview,
    unreadCount: raw.unreadCount ?? 0,
    mutedUntil: iso(raw.mutedUntil),
    archivedAt: iso(raw.archivedAt),
    peer: peer
      ? {
          id: peer.userId,
          displayName: peer.displayName,
          isOnline: presence?.isOnline,
          lastSeenAt: presence?.lastSeenAt ?? null,
        }
      : null,
    listingTitle: title,
    listingImageUrl: mediaPublicUrl(key),
    dealerName: raw.dealerOrganization?.name ?? null,
  };
}

export function mapInbox(raw: {
  items: ApiConversation[];
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
  totalUnread: number;
}): InboxPage {
  return {
    items: raw.items.map(mapConversation),
    page: raw.page,
    pageSize: raw.pageSize,
    total: raw.total,
    totalPages: raw.totalPages ?? Math.max(1, Math.ceil(raw.total / raw.pageSize)),
    totalUnread: raw.totalUnread ?? 0,
  };
}

export function mapMessage(raw: {
  id: string;
  conversationId: string;
  senderId: string | null;
  type: ChatMessage['type'];
  body: string | null;
  payload: Record<string, unknown> | null;
  clientId: string | null;
  status: ChatMessage['status'];
  flagged?: boolean;
  createdAt: string | Date;
}): ChatMessage {
  return {
    id: raw.id,
    conversationId: raw.conversationId,
    senderId: raw.senderId,
    type: raw.type,
    body: raw.body,
    payload: raw.payload,
    clientId: raw.clientId,
    status: raw.status,
    flagged: raw.flagged,
    createdAt: iso(raw.createdAt) ?? new Date().toISOString(),
    localStatus: 'synced',
  };
}

export function mapMessagesPage(raw: {
  items: Parameters<typeof mapMessage>[0][];
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
}): MessagesPage {
  return {
    items: raw.items.map(mapMessage),
    page: raw.page,
    pageSize: raw.pageSize,
    total: raw.total,
    totalPages: raw.totalPages ?? 1,
  };
}
