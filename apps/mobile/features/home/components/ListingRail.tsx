import React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Skeleton, Text, useTheme } from '@autohub/mobile-ui';
import { ListingCard } from './ListingCard';
import type { ListingCardModel } from '../domain/types';

export type ListingRailProps = {
  title: string;
  subtitle?: string;
  listings: ListingCardModel[];
  loading?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
  onPressListing?: (listing: ListingCardModel) => void;
  onSeeAll?: () => void;
};

export function ListingRail({
  title,
  subtitle,
  listings,
  loading,
  emptyTitle = 'Nothing here yet',
  emptyBody,
  onPressListing,
  onSeeAll,
}: ListingRailProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.md }}>
      <View
        style={{
          flexDirection: theme.isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.layout.gutter,
        }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="h3">{title}</Text>
          {subtitle ? (
            <Text variant="caption" color="secondary">
              {subtitle}
            </Text>
          ) : null}
        </View>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll} hitSlop={8}>
            <Text variant="label" color="brand">
              See all
            </Text>
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <FlatList
          horizontal
          inverted={theme.isRTL}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: theme.layout.gutter,
            gap: theme.spacing.md,
          }}
          data={[1, 2, 3]}
          keyExtractor={(i) => String(i)}
          renderItem={() => (
            <View style={{ width: 200, gap: theme.spacing.sm }}>
              <Skeleton height={110} radius={theme.radii.md} />
              <Skeleton height={14} width="80%" />
              <Skeleton height={14} width="50%" />
            </View>
          )}
        />
      ) : listings.length === 0 ? (
        <View style={{ paddingHorizontal: theme.layout.gutter }}>
          <Text variant="body" color="secondary">
            {emptyTitle}
            {emptyBody ? ` — ${emptyBody}` : ''}
          </Text>
        </View>
      ) : (
        <FlatList
          horizontal
          inverted={theme.isRTL}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: theme.layout.gutter,
            gap: theme.spacing.md,
          }}
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListingCard compact listing={item} onPress={onPressListing} />
          )}
        />
      )}
    </View>
  );
}
