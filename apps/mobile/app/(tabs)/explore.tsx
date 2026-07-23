import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { EmptyState, ErrorState, Text, useTheme } from '@autohub/mobile-ui';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';
import { CategoriesRow } from '@/features/home/components/CategoriesRow';
import { ListingCard } from '@/features/home/components/ListingCard';
import {
  useCategories,
  useExploreListingsInfinite,
  useRecordListingView,
} from '@/features/home/hooks/useHomeQueries';
import type { ListingCardModel } from '@/features/home/domain/types';

export default function ExploreScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ category?: string }>();
  const [categoryCode, setCategoryCode] = useState<string | undefined>(
    typeof params.category === 'string' ? params.category : undefined,
  );
  const [refreshing, setRefreshing] = useState(false);

  const categories = useCategories();
  const explore = useExploreListingsInfinite(categoryCode, 12);
  const recordView = useRecordListingView();

  const items = useMemo(
    () => explore.data?.pages.flatMap((p) => p.items) ?? [],
    [explore.data],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await explore.refetch();
      await categories.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [explore, categories]);

  const openListing = useCallback(
    (listing: ListingCardModel) => {
      void recordView.mutateAsync(listing);
      router.push(`/listing/${listing.id}`);
    },
    [recordView],
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <OfflineBanner />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
        onEndReached={() => {
          if (explore.hasNextPage && !explore.isFetchingNextPage) {
            void explore.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{
          paddingBottom: theme.spacing['4xl'],
          gap: theme.spacing.md,
        }}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.lg }}>
            <View style={{ paddingHorizontal: theme.layout.gutter, gap: theme.spacing.xs }}>
              <Text variant="h1">Explore</Text>
              <Text variant="body" color="secondary">
                Browse active listings by category.
              </Text>
            </View>
            <CategoriesRow
              categories={categories.data ?? []}
              loading={categories.isLoading}
              selectedCode={categoryCode}
              onSelect={(cat) =>
                setCategoryCode((prev) => (prev === cat.code ? undefined : cat.code))
              }
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: theme.layout.gutter }}>
            <ListingCard listing={item} onPress={openListing} />
          </View>
        )}
        ListEmptyComponent={
          explore.isError ? (
            <ErrorState
              title="Couldn’t load listings"
              description={
                explore.error instanceof Error ? explore.error.message : 'Please try again.'
              }
              retryLabel="Retry"
              onRetry={() => void explore.refetch()}
            />
          ) : !explore.isLoading ? (
            <EmptyState
              title="No listings in this category"
              description="Try another category or clear the filter."
              actionLabel="Clear filter"
              onAction={() => setCategoryCode(undefined)}
            />
          ) : null
        }
        ListFooterComponent={
          explore.isFetchingNextPage ? (
            <ActivityIndicator style={{ marginVertical: theme.spacing.lg }} color={theme.colors.primary} />
          ) : null
        }
      />
    </View>
  );
}
