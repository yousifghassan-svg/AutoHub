import React from 'react';
import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Badge, Button, Icon, Text, useTheme } from '@autohub/mobile-ui';
import { formatPrice } from '@/features/home/domain/mappers';
import type { ManagedListing } from '../domain/types';

const STATUS_TONE: Record<
  ManagedListing['status'],
  'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info'
> = {
  DRAFT: 'neutral',
  PENDING: 'warning',
  ACTIVE: 'success',
  RESERVED: 'info',
  SOLD: 'brand',
  ARCHIVED: 'neutral',
};

export type ManagedListingCardProps = {
  listing: ManagedListing;
  onPress: () => void;
  onManage: () => void;
  onStats: () => void;
};

export function ManagedListingCard({
  listing,
  onPress,
  onManage,
  onStats,
}: ManagedListingCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
      }}
    >
      <View style={{ flexDirection: theme.isRTL ? 'row-reverse' : 'row' }}>
        <View style={{ width: 110, height: 110, backgroundColor: theme.colors.surfaceMuted }}>
          {listing.imageUrl ? (
            <Image
              source={{ uri: listing.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="car-sport-outline" color={theme.colors.textSecondary} />
            </View>
          )}
        </View>
        <View style={{ flex: 1, padding: theme.spacing.md, gap: theme.spacing.xs }}>
          <Badge tone={STATUS_TONE[listing.status]}>{listing.status}</Badge>
          <Text variant="label" numberOfLines={2}>
            {listing.title}
          </Text>
          <Text variant="body" color="brand">
            {formatPrice(listing.price, listing.currencyCode)}
          </Text>
          <Text variant="caption" color="secondary" numberOfLines={1}>
            {listing.location || '—'} · {listing.stats.views} views · {listing.stats.favorites}{' '}
            fav
          </Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: theme.isRTL ? 'row-reverse' : 'row',
          gap: theme.spacing.sm,
          padding: theme.spacing.sm,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <Button size="sm" variant="ghost" onPress={onStats} style={{ flex: 1 }}>
          Stats
        </Button>
        <Button size="sm" variant="secondary" onPress={onManage} style={{ flex: 1 }}>
          Manage
        </Button>
      </View>
    </Pressable>
  );
}
