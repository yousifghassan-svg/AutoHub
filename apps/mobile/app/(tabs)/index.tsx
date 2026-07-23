import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { EmptyState, ErrorState, Text, useTheme } from '@autohub/mobile-ui';
import { useQueryClient } from '@tanstack/react-query';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';
import { CategoriesRow, SearchBarEntry } from '@/features/home/components/CategoriesRow';
import { HomeSkeleton } from '@/features/home/components/HomeSkeleton';
import { ListingCard } from '@/features/home/components/ListingCard';
import { ListingRail } from '@/features/home/components/ListingRail';
import { QuickActions, RecommendedPlaceholder } from '@/features/home/components/QuickActions';
import {
  refreshHomeQueries,
  useCategories,
  useFeaturedListings,
  useLatestListingsInfinite,
  useRecentlyViewed,
  useRecordListingView,
} from '@/features/home/hooks/useHomeQueries';
import type { ListingCardModel } from '@/features/home/domain/types';
import { ApiError } from '@/lib/api/types';

export default function HomeScreen() {
  const theme = useTheme();
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const featured = useFeaturedListings();
  const latest = useLatestListingsInfinite(8);
  const categories = useCategories();
  const recentlyViewed = useRecentlyViewed();
  const recordView = useRecordListingView();

  const latestItems = useMemo(
    () => latest.data?.pages.flatMap((p) => p.items) ?? [],
    [latest.data],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshHomeQueries(qc);
    } finally {
      setRefreshing(false);
    }
  }, [qc]);

  const openListing = useCallback(
    (listing: ListingCardModel) => {
      void recordView.mutateAsync(listing);
      router.push(`/listing/${listing.id}`);
    },
    [recordView],
  );

  const bootLoading =
    featured.isLoading && latest.isLoading && categories.isLoading && !featured.data;

  const fatalError =
    featured.isError && latest.isError
      ? featured.error
      : null;

  if (bootLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <OfflineBanner />
        <HomeSkeleton />
      </View>
    );
  }

  if (fatalError) {
    const offline = fatalError instanceof ApiError && fatalError.offline;
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <OfflineBanner />
        <ErrorState
          title={offline ? 'You are offline' : 'Could not load home'}
          description={
            offline
              ? 'Connect to the internet and pull to refresh.'
              : fatalError instanceof Error
                ? fatalError.message
                : 'Please try again.'
          }
          retryLabel="Retry"
          onRetry={() => void onRefresh()}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <OfflineBanner />
      <FlatList
        data={latestItems}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
        onEndReached={() => {
          if (latest.hasNextPage && !latest.isFetchingNextPage) {
            void latest.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{
          paddingBottom: theme.spacing['4xl'],
          gap: theme.spacing.md,
        }}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.xl, paddingTop: theme.spacing.lg }}>
            <View style={{ paddingHorizontal: theme.layout.gutter, gap: theme.spacing.xs }}>
              <Text variant="overline" color="brand">
                AUTOHUB
              </Text>
              <Text variant="h1">Home</Text>
            </View>

            <SearchBarEntry
              placeholder="Search cars, plates, trucks…"
              onPress={() => router.push('/(tabs)/search')}
            />

            <CategoriesRow
              categories={categories.data ?? []}
              loading={categories.isLoading}
              onSelect={(cat) =>
                router.push({ pathname: '/(tabs)/explore', params: { category: cat.code } })
              }
            />

            <QuickActions
              actions={[
                {
                  key: 'sell',
                  label: 'Sell a vehicle',
                  icon: 'add-circle-outline',
                  onPress: () => router.push('/sell'),
                },
                {
                  key: 'search',
                  label: 'Search',
                  icon: 'search-outline',
                  onPress: () => router.push('/(tabs)/search'),
                },
                {
                  key: 'alerts',
                  label: 'Alerts',
                  icon: 'notifications-outline',
                  onPress: () => router.push('/(tabs)/notifications'),
                },
                {
                  key: 'profile',
                  label: 'Profile',
                  icon: 'person-outline',
                  onPress: () => router.push('/(tabs)/account'),
                },
              ]}
            />

            <ListingRail
              title="Featured"
              listings={featured.data ?? []}
              loading={featured.isLoading}
              emptyTitle="No featured listings"
              onPressListing={openListing}
              onSeeAll={() => router.push('/(tabs)/explore')}
            />

            <ListingRail
              title="Recently viewed"
              listings={recentlyViewed.data ?? []}
              loading={recentlyViewed.isLoading}
              emptyTitle="No recently viewed listings"
              emptyBody="Open a listing to see it here"
              onPressListing={openListing}
            />

            <RecommendedPlaceholder />

            <View
              style={{
                paddingHorizontal: theme.layout.gutter,
                flexDirection: theme.isRTL ? 'row-reverse' : 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text variant="h3">Latest listings</Text>
              <Pressable onPress={() => router.push('/(tabs)/explore')}>
                <Text variant="label" color="brand">
                  Explore
                </Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: theme.layout.gutter }}>
            <ListingCard listing={item} onPress={openListing} />
          </View>
        )}
        ListEmptyComponent={
          !latest.isLoading ? (
            <EmptyState
              title="No listings yet"
              description="Pull to refresh or explore categories."
              actionLabel="Explore"
              onAction={() => router.push('/(tabs)/explore')}
            />
          ) : null
        }
        ListFooterComponent={
          latest.isFetchingNextPage ? (
            <ActivityIndicator style={{ marginVertical: theme.spacing.lg }} color={theme.colors.primary} />
          ) : null
        }
      />
    </View>
  );
}
