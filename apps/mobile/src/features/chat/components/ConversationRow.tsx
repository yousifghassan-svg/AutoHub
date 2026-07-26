import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Badge, Text, useTheme } from '@autohub/mobile-ui';
import type { ConversationSummary } from '../domain/types';

export function ConversationRow({
  item,
  onPress,
  onLongPress,
}: {
  item: ConversationSummary;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const theme = useTheme();
  const title =
    item.peer?.displayName ||
    item.listingTitle ||
    item.dealerName ||
    'Conversation';
  const subtitle = item.lastMessagePreview || 'No messages yet';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={{
        flexDirection: theme.isRTL ? 'row-reverse' : 'row',
        gap: theme.spacing.md,
        padding: theme.spacing.md,
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: item.unreadCount > 0 ? theme.colors.primarySoft : theme.colors.surface,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: theme.radii.md,
          backgroundColor: theme.colors.surfaceMuted,
          overflow: 'hidden',
        }}
      >
        {item.listingImageUrl ? (
          <Image
            source={{ uri: item.listingImageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : null}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View
          style={{
            flexDirection: theme.isRTL ? 'row-reverse' : 'row',
            justifyContent: 'space-between',
            gap: theme.spacing.sm,
          }}
        >
          <Text variant="label" numberOfLines={1} style={{ flex: 1 }}>
            {title}
          </Text>
          {item.lastMessageAt ? (
            <Text variant="caption" color="secondary">
              {new Date(item.lastMessageAt).toLocaleDateString()}
            </Text>
          ) : null}
        </View>
        <Text variant="caption" color="secondary" numberOfLines={1}>
          {item.peer?.isOnline ? 'Online · ' : ''}
          {subtitle}
        </Text>
        {item.marketplaceDomain || item.mutedUntil ? (
          <View
            style={{
              flexDirection: theme.isRTL ? 'row-reverse' : 'row',
              gap: theme.spacing.xs,
              marginTop: 2,
            }}
          >
            {item.marketplaceDomain ? <Badge tone="neutral">{item.marketplaceDomain}</Badge> : null}
            {item.mutedUntil ? <Badge tone="warning">Muted</Badge> : null}
            {item.archivedAt ? <Badge>Archived</Badge> : null}
          </View>
        ) : null}
      </View>
      {item.unreadCount > 0 ? (
        <View
          style={{
            minWidth: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 6,
          }}
        >
          <Text variant="caption" color="inverse">
            {item.unreadCount > 99 ? '99+' : item.unreadCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
