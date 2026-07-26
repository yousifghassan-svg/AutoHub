import { FlatList, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { AppBar, EmptyState, Screen, Text, useI18n, useTheme } from '@autohub/mobile-ui';
import { ListingCard } from '@/features/home/components/ListingCard';
import type { ListingCardModel } from '@/features/home/domain/types';
import { safeBack } from '@/lib/navigation';
import { useFavoritesStore } from '@/src/features/favorites/favorites.store';
import { marketplaceDetailPath } from '@/src/hooks/useMarketplacePath';

export default function SavedItemsScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const items = useFavoritesStore((s) => s.items);
  const remove = useFavoritesStore((s) => s.remove);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBar title={t('savedItems')} leadingIcon="chevron-back" onLeadingPress={() => safeBack()} />
      <Screen>
        {items.length === 0 ? (
          <EmptyState
            title={t('emptyTitle')}
            description="Tap the heart on a vehicle or plate to save it here."
            actionLabel={t('search')}
            onAction={() => router.push('/(tabs)/search')}
          />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: theme.spacing.md, paddingBottom: theme.spacing['4xl'] }}
            renderItem={({ item }) => (
              <View style={{ gap: theme.spacing.xs }}>
                <ListingCard
                  listing={item as ListingCardModel}
                  onPress={() => router.push(marketplaceDetailPath(item) as never)}
                />
                <Pressable onPress={() => remove(item.id)}>
                  <Text
                    variant="caption"
                    color="brand"
                    style={{ paddingHorizontal: theme.spacing.xs }}
                  >
                    Remove
                  </Text>
                </Pressable>
              </View>
            )}
          />
        )}
      </Screen>
    </View>
  );
}
