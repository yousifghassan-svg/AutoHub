import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text, useTheme } from '@autohub/mobile-ui';
import type { ChatMessage } from '../domain/types';

export function MessageBubble({
  message,
  isMine,
}: {
  message: ChatMessage;
  isMine: boolean;
}) {
  const theme = useTheme();
  const align = isMine
    ? theme.isRTL
      ? 'flex-start'
      : 'flex-end'
    : theme.isRTL
      ? 'flex-end'
      : 'flex-start';

  const bg = isMine ? theme.colors.primary : theme.colors.surfaceMuted;
  const textColor = isMine ? 'inverse' : 'primary';

  return (
    <View style={{ alignSelf: align, maxWidth: '82%', gap: 4 }}>
      <View
        style={{
          backgroundColor: bg,
          borderRadius: theme.radii.lg,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          gap: theme.spacing.xs,
        }}
      >
        {message.type === 'IMAGE' && typeof message.payload?.uri === 'string' ? (
          <Image
            source={{ uri: message.payload.uri as string }}
            style={{ width: 200, height: 160, borderRadius: theme.radii.md }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : null}

        {message.type === 'LISTING_CARD' ? (
          <View style={{ gap: 2 }}>
            <Text variant="caption" color={isMine ? 'inverse' : 'secondary'}>
              Listing
            </Text>
            <Text variant="label" color={textColor}>
              {(message.payload?.title as string) ?? message.body ?? 'Listing'}
            </Text>
            {message.payload?.price != null ? (
              <Text variant="caption" color={isMine ? 'inverse' : 'brand'}>
                {String(message.payload.price)} {String(message.payload.currencyCode ?? '')}
              </Text>
            ) : null}
          </View>
        ) : null}

        {message.type === 'DEALER_CARD' ? (
          <Text variant="label" color={textColor}>
            Dealer: {(message.payload?.name as string) ?? message.body ?? 'Dealer'}
          </Text>
        ) : null}

        {message.type === 'CONTACT_CARD' ? (
          <View style={{ gap: 2 }}>
            <Text variant="label" color={textColor}>
              {(message.payload?.name as string) ?? 'Contact'}
            </Text>
            <Text variant="caption" color={isMine ? 'inverse' : 'secondary'}>
              {(message.payload?.phone as string) ?? ''}
            </Text>
          </View>
        ) : null}

        {message.type === 'LOCATION' ? (
          <Text variant="body" color={textColor}>
            📍 {String(message.payload?.lat ?? '')}, {String(message.payload?.lng ?? '')}
          </Text>
        ) : null}

        {message.type === 'SYSTEM' ? (
          <Text variant="caption" color={isMine ? 'inverse' : 'secondary'}>
            {message.body}
          </Text>
        ) : null}

        {message.type === 'TEXT' || (!message.type && message.body) ? (
          <Text variant="body" color={textColor}>
            {message.body}
          </Text>
        ) : null}

        {message.body &&
        message.type !== 'TEXT' &&
        message.type !== 'SYSTEM' &&
        message.type !== 'LISTING_CARD' ? (
          <Text variant="caption" color={isMine ? 'inverse' : 'secondary'}>
            {message.body}
          </Text>
        ) : null}
      </View>
      <Text variant="caption" color="secondary" style={{ alignSelf: align }}>
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        {isMine
          ? ` · ${message.localStatus === 'queued' || message.localStatus === 'failed' ? 'Queued' : message.status}`
          : ''}
      </Text>
    </View>
  );
}
