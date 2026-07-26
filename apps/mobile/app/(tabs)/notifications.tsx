import { useEffect, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppBar, EmptyState, Screen, Text, useTheme } from '@autohub/mobile-ui';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';
import { getHttpClient } from '@/lib/api/client';
import { createNotificationsRepository } from '@/src/features/notifications/data/notifications.repository';
import {
  useListingNotificationsStore,
  type ListingNotification,
} from '@/src/features/notifications/listing-notifications.store';
import { getExpoPushTokenSafe } from '@/src/services/notifications';

function rowTone(read: boolean, theme: ReturnType<typeof useTheme>) {
  return read ? theme.colors.surface : theme.colors.primarySoft;
}

export default function NotificationsScreen() {
  const theme = useTheme();
  const qc = useQueryClient();
  const localItems = useListingNotificationsStore((s) => s.items);
  const markLocalRead = useListingNotificationsStore((s) => s.markRead);
  const markAllLocal = useListingNotificationsStore((s) => s.markAllRead);
  const repo = useMemo(() => createNotificationsRepository(getHttpClient()), []);

  const remote = useQuery({
    queryKey: ['notifications', 'remote'],
    queryFn: () => repo.list(1, 40),
  });

  useEffect(() => {
    void (async () => {
      const token = await getExpoPushTokenSafe();
      if (token) {
        try {
          await repo.registerDevice(token, 'EXPO');
        } catch {
          // ignore registration failures in dev
        }
      }
    })();
  }, [repo]);

  const remoteItems = remote.data?.items ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBar
        title="Notifications"
        trailing={
          <Pressable
            onPress={() => {
              markAllLocal();
              void repo.markAllRead().then(() =>
                qc.invalidateQueries({ queryKey: ['notifications'] }),
              );
            }}
          >
            <Text variant="caption" color="brand">
              Mark all read
            </Text>
          </Pressable>
        }
      />
      <OfflineBanner />
      <Screen scroll>
        <View style={{ gap: theme.spacing.md }}>
          <Text variant="body" color="secondary">
            New messages, listing approvals/rejections, price changes, favourites, dealer replies.
          </Text>
          <Pressable onPress={() => router.push('/inbox' as never)}>
            <Text variant="caption" color="brand">
              Open messages inbox →
            </Text>
          </Pressable>

          {remoteItems.length === 0 && localItems.length === 0 ? (
            <EmptyState
              icon="notifications-outline"
              title="No notifications yet"
              description="Push and in-app alerts appear here."
            />
          ) : null}

          {remoteItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                void repo.markRead(item.id).then(() =>
                  qc.invalidateQueries({ queryKey: ['notifications'] }),
                );
                const conversationId = item.data?.conversationId;
                if (typeof conversationId === 'string') {
                  router.push(`/inbox/${conversationId}` as never);
                }
              }}
              style={{
                padding: theme.spacing.lg,
                borderRadius: theme.radii.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: rowTone(Boolean(item.readAt), theme),
                gap: 4,
              }}
            >
              <Text variant="label">{item.title}</Text>
              <Text variant="caption" color="brand">
                {item.type}
              </Text>
              <Text variant="body" color="secondary">
                {item.body}
              </Text>
              <Text variant="caption" color="secondary">
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </Pressable>
          ))}

          {localItems.map((item: ListingNotification) => (
            <Pressable
              key={item.id}
              onPress={() => {
                markLocalRead(item.id);
                router.push(
                  (item.domain === 'VEHICLE'
                    ? `/vehicle/${item.listingId}`
                    : `/plate/${item.listingId}`) as never,
                );
              }}
              style={{
                padding: theme.spacing.lg,
                borderRadius: theme.radii.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: rowTone(item.read, theme),
                gap: 4,
              }}
            >
              <Text variant="label">{item.title}</Text>
              <Text variant="caption" color="brand">
                {item.status}
              </Text>
              <Text variant="body" color="secondary">
                {item.message}
              </Text>
            </Pressable>
          ))}
        </View>
      </Screen>
    </View>
  );
}
