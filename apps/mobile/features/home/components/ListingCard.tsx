import React from 'react';
import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Badge, Icon, Text, useTheme } from '@autohub/mobile-ui';
import { formatMileage, formatPrice } from '../domain/mappers';
import type { ListingCardModel } from '../domain/types';

export type ListingCardProps = {
  listing: ListingCardModel;
  onPress?: (listing: ListingCardModel) => void;
  onFavoritePress?: (listing: ListingCardModel) => void;
  compact?: boolean;
};

export const ListingCard = React.memo(function ListingCard({
  listing,
  onPress,
  onFavoritePress,
  compact = false,
}: ListingCardProps) {
  const theme = useTheme();
  const imageHeight = compact ? 110 : 150;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(listing)}
      style={{
        width: compact ? 200 : '100%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
      }}
    >
      <View style={{ height: imageHeight, backgroundColor: theme.colors.surfaceMuted }}>
        {listing.imageUrl ? (
          <Image
            source={{ uri: listing.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="car-sport-outline" size={36} color={theme.colors.textSecondary} />
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Favorite placeholder"
          onPress={() => onFavoritePress?.(listing)}
          hitSlop={8}
          style={{
            position: 'absolute',
            top: theme.spacing.sm,
            ...(theme.isRTL ? { left: theme.spacing.sm } : { right: theme.spacing.sm }),
            width: 36,
            height: 36,
            borderRadius: theme.radii.full,
            backgroundColor: theme.colors.overlay,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="heart-outline" size={18} color={theme.colors.textInverse} />
        </Pressable>
      </View>

      <View style={{ padding: theme.spacing.md, gap: theme.spacing.xs }}>
        <View
          style={{
            flexDirection: theme.isRTL ? 'row-reverse' : 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.xs,
          }}
        >
          {listing.isFeatured ? <Badge tone="brand">Featured</Badge> : null}
          {listing.isVerified ? <Badge tone="success">Verified</Badge> : null}
        </View>

        <Text variant="label" numberOfLines={2}>
          {listing.title}
        </Text>

        <Text variant="h3" color="brand">
          {formatPrice(listing.price, listing.currencyCode)}
        </Text>

        <Text variant="caption" color="secondary" numberOfLines={1}>
          {[listing.location, listing.year, formatMileage(listing.mileageKm)]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
    </Pressable>
  );
});
