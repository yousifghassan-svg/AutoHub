import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppBar, Text, useTheme } from '@autohub/mobile-ui';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';
import { useAuth } from '@/features/auth/context/AuthProvider';
import { safeBack } from '@/lib/navigation';
import { MessageBubble } from '@/src/features/chat/components/MessageBubble';
import {
  emitTyping,
  joinConversationRoom,
  leaveConversationRoom,
} from '@/src/features/chat/data/chat.socket';
import { getChatRepository } from '@/src/features/chat/di';
import {
  useConversation,
  useMessagesInfinite,
  useSendMessage,
} from '@/src/features/chat/hooks/useChat';

export default function ConversationScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const conversationId = id ?? '';
  const conversation = useConversation(conversationId);
  const messagesQuery = useMessagesInfinite(conversationId);
  const send = useSendMessage(conversationId);
  const [text, setText] = useState('');
  const [peerTyping, setPeerTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const messages = useMemo(() => {
    const items = messagesQuery.data?.pages.flatMap((p) => p.items) ?? [];
    return [...items].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [messagesQuery.data]);

  useEffect(() => {
    if (!conversationId) return;
    joinConversationRoom(conversationId);
    void getChatRepository().markRead(conversationId);
    void getChatRepository().markDelivered(conversationId);
    return () => leaveConversationRoom(conversationId);
  }, [conversationId]);

  const onChangeText = (value: string) => {
    setText(value);
    emitTyping(conversationId, true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitTyping(conversationId, false), 1200);
  };

  const onSend = () => {
    const body = text.trim();
    if (!body || send.isPending) return;
    setText('');
    emitTyping(conversationId, false);
    send.mutate(
      { type: 'TEXT', body },
      {
        onError: (e) =>
          Alert.alert('Send failed', e instanceof Error ? e.message : 'Queued for retry'),
      },
    );
  };

  const title =
    conversation.data?.peer?.displayName ||
    conversation.data?.listingTitle ||
    conversation.data?.dealerName ||
    'Chat';

  const subtitle = peerTyping
    ? 'Typing…'
    : conversation.data?.peer?.isOnline
      ? 'Online'
      : conversation.data?.peer?.lastSeenAt
        ? `Last seen ${new Date(conversation.data.peer.lastSeenAt).toLocaleString()}`
        : undefined;

  const openMenu = () => {
    const peerId = conversation.data?.peer?.id;
    Alert.alert('Conversation', undefined, [
      {
        text: 'Mute 24h',
        onPress: () =>
          void getChatRepository().updateConversation(conversationId, {
            mutedUntil: new Date(Date.now() + 24 * 3600_000).toISOString(),
          }),
      },
      {
        text: 'Archive',
        onPress: () =>
          void getChatRepository().updateConversation(conversationId, { archive: true }),
      },
      {
        text: 'Report conversation',
        onPress: () =>
          void getChatRepository().report(conversationId, 'INAPPROPRIATE', 'User report'),
      },
      peerId
        ? {
            text: 'Block user',
            style: 'destructive' as const,
            onPress: () => void getChatRepository().blockUser(peerId, 'Blocked from chat'),
          }
        : undefined,
      {
        text: 'Delete from inbox',
        style: 'destructive' as const,
        onPress: () =>
          void getChatRepository()
            .updateConversation(conversationId, { hide: true })
            .then(() => safeBack()),
      },
      { text: 'Cancel', style: 'cancel' as const },
    ].filter(Boolean) as never);
  };

  // silence unused setter warning path for typing from socket — local demo toggle
  useEffect(() => {
    setPeerTyping(false);
  }, [messages.length]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppBar
        title={title}
        subtitle={subtitle}
        leadingIcon={theme.isRTL ? 'chevron-forward' : 'chevron-back'}
        onLeadingPress={() => safeBack()}
        trailing={
          <Pressable onPress={openMenu}>
            <Text variant="caption" color="brand">
              More
            </Text>
          </Pressable>
        }
      />
      <OfflineBanner />
      {messagesQuery.isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: theme.layout.gutter,
            gap: theme.spacing.sm,
            paddingBottom: theme.spacing.lg,
          }}
          onEndReached={() => {
            if (messagesQuery.hasNextPage) void messagesQuery.fetchNextPage();
          }}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isMine={Boolean(item.senderId && item.senderId === session?.user.id)}
            />
          )}
        />
      )}
      <View
        style={{
          flexDirection: theme.isRTL ? 'row-reverse' : 'row',
          gap: theme.spacing.sm,
          padding: theme.layout.gutter,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          alignItems: 'center',
        }}
      >
        <TextInput
          value={text}
          onChangeText={onChangeText}
          placeholder="Message…"
          placeholderTextColor={theme.colors.textSecondary}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radii.lg,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            color: theme.colors.text,
            maxHeight: 120,
          }}
          multiline
        />
        <Pressable
          onPress={onSend}
          disabled={!text.trim() || send.isPending}
          style={{
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.radii.md,
            backgroundColor: theme.colors.primary,
            opacity: !text.trim() || send.isPending ? 0.5 : 1,
          }}
        >
          <Text variant="label" color="inverse">
            Send
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
