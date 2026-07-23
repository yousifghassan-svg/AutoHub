import React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Text, useTheme } from '@autohub/mobile-ui';
import { formatPrice } from '@/features/home/domain/mappers';
import type { SimilarListing } from '../domain/types';

export function SimilarRail({
  items,
  onPress,
}: {
  items: SimilarListing[];
  onPress: (id: string) => void;
}) {
  const theme = useTheme();

  if (!items.length) {
    return (
      <Text variant="body" color="secondary">
        No similar listings right now.
      </Text>
    );
  }

  return (
    <FlatList
      horizontal
      inverted={theme.isRTL}
      showsHorizontalScrollIndicator={false}
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ gap: theme.spacing.md }}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onPress(item.id)}
          style={{
            width: 180,
            borderRadius: theme.radii.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            overflow: 'hidden',
          }}
        >
          <View style={{ height: 100, backgroundColor: theme.colors.surfaceMuted }}>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : null}
          </View>
          <View style={{ padding: theme.spacing.sm, gap: 4 }}>
            <Text variant="label" numberOfLines={2}>
              {item.title}
            </Text>
            <Text variant="caption" color="brand">
              {formatPrice(item.price, item.currencyCode)}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}
