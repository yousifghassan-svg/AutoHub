import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { AppBar, EmptyState, ErrorState, Text, useTheme } from '@autohub/mobile-ui';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';
import { safeBack } from '@/lib/navigation';
import { ConversationRow } from '@/src/features/chat/components/ConversationRow';
import { getChatRepository } from '@/src/features/chat/di';
import { useInboxInfinite } from '@/src/features/chat/hooks/useChat';
import type { ConversationSummary } from '@/src/features/chat/domain/types';

export default function InboxScreen() {
  const theme = useTheme();
  const [q, setQ] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [archived, setArchived] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const query = useInboxInfinite({
    q: q.trim() || undefined,
    unreadOnly: unreadOnly || undefined,
    archived: archived || undefined,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data],
  );
  const totalUnread = query.data?.pages[0]?.totalUnread ?? 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [query]);

  const openActions = (item: ConversationSummary) => {
    const repo = getChatRepository();
    const refresh = () => void query.refetch();
    Alert.alert(item.peer?.displayName ?? 'Conversation', undefined, [
      {
        text: item.archivedAt ? 'Unarchive' : 'Archive',
        onPress: () =>
          void repo
            .updateConversation(
              item.id,
              item.archivedAt ? { unarchive: true } : { archive: true },
            )
            .then(refresh),
      },
      {
        text: item.mutedUntil ? 'Unmute' : 'Mute 24h',
        onPress: () =>
          void repo
            .updateConversation(
              item.id,
              item.mutedUntil
                ? { unmute: true }
                : { mutedUntil: new Date(Date.now() + 24 * 3600_000).toISOString() },
            )
            .then(refresh),
      },
      {
        text: 'Delete from inbox',
        style: 'destructive',
        onPress: () => void repo.updateConversation(item.id, { hide: true }).then(refresh),
      },
      {
        text: 'Report',
        onPress: () => void repo.report(item.id, 'SPAM', 'Reported from inbox').then(refresh),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBar
        title="Messages"
        subtitle={totalUnread > 0 ? `${totalUnread} unread` : undefined}
        leadingIcon={theme.isRTL ? 'chevron-forward' : 'chevron-back'}
        onLeadingPress={() => safeBack()}
      />
      <OfflineBanner />
      <View style={{ padding: theme.layout.gutter, gap: theme.spacing.sm }}>
        <TextInput
          placeholder="Search conversations"
          value={q}
          onChangeText={setQ}
          placeholderTextColor={theme.colors.textSecondary}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radii.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            color: theme.colors.text,
            backgroundColor: theme.colors.surface,
          }}
        />
        <View
          style={{
            flexDirection: theme.isRTL ? 'row-reverse' : 'row',
            gap: theme.spacing.md,
          }}
        >
          <Text
            variant="caption"
            color={unreadOnly ? 'brand' : 'secondary'}
            onPress={() => setUnreadOnly((v) => !v)}
          >
            {unreadOnly ? '● Unread' : '○ Unread'}
          </Text>
          <Text
            variant="caption"
            color={archived ? 'brand' : 'secondary'}
            onPress={() => setArchived((v) => !v)}
          >
            {archived ? '● Archived' : '○ Archived'}
          </Text>
        </View>
      </View>

      {query.isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : query.isError ? (
        <ErrorState
          title="Could not load inbox"
          description={query.error instanceof Error ? query.error.message : 'Try again'}
          retryLabel="Retry"
          onRetry={() => void query.refetch()}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: theme.layout.gutter,
            gap: theme.spacing.sm,
            paddingBottom: theme.spacing['4xl'],
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
          }
          onEndReached={() => {
            if (query.hasNextPage) void query.fetchNextPage();
          }}
          renderItem={({ item }) => (
            <ConversationRow
              item={item}
              onPress={() => router.push(`/inbox/${item.id}` as never)}
              onLongPress={() => openActions(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubble-outline"
              title="No conversations"
              description="Message a seller from any vehicle or plate listing."
            />
          }
        />
      )}
    </View>
  );
}
