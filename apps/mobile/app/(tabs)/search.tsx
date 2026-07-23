import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Chip, EmptyState, ErrorState, Input, Text, useTheme } from '@autohub/mobile-ui';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';
import { ListingCard } from '@/features/home/components/ListingCard';
import {
  useRecentSearches,
  useRecordListingView,
  useSearchListingsInfinite,
} from '@/features/home/hooks/useHomeQueries';
import type { ListingCardModel } from '@/features/home/domain/types';

export default function SearchEntryScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const recent = useRecentSearches();
  const search = useSearchListingsInfinite(submitted, 12);
  const recordView = useRecordListingView();

  const items = useMemo(
    () => search.data?.pages.flatMap((p) => p.items) ?? [],
    [search.data],
  );

  const onSubmit = useCallback(() => {
    setSubmitted(query.trim());
  }, [query]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([recent.refetch(), search.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [recent, search]);

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
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
        onEndReached={() => {
          if (search.hasNextPage && !search.isFetchingNextPage) {
            void search.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{
          paddingBottom: theme.spacing['4xl'],
          gap: theme.spacing.md,
        }}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.lg }}>
            <View style={{ paddingHorizontal: theme.layout.gutter, gap: theme.spacing.md }}>
              <Text variant="h1">Search</Text>
              <Input
                label="Keyword"
                placeholder="Make, model, city…"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={onSubmit}
                returnKeyType="search"
              />
              <Pressable onPress={onSubmit}>
                <Text variant="label" color="brand">
                  Search listings
                </Text>
              </Pressable>
            </View>

            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="h3" style={{ paddingHorizontal: theme.layout.gutter }}>
                Recent searches
              </Text>
              <View
                style={{
                  paddingHorizontal: theme.layout.gutter,
                  flexDirection: theme.isRTL ? 'row-reverse' : 'row',
                  flexWrap: 'wrap',
                  gap: theme.spacing.sm,
                }}
              >
                {(recent.data ?? []).length === 0 ? (
                  <Text variant="body" color="secondary">
                    Your recent searches will appear here after you search while signed in.
                  </Text>
                ) : (
                  (recent.data ?? []).map((item) => {
                    const label = item.keyword ?? 'Saved filter';
                    return (
                      <Chip
                        key={item.id}
                        label={label}
                        onPress={() => {
                          setQuery(item.keyword ?? '');
                          setSubmitted(item.keyword?.trim() ?? '');
                        }}
                      />
                    );
                  })
                )}
              </View>
            </View>

            {submitted ? (
              <Text
                variant="h3"
                style={{ paddingHorizontal: theme.layout.gutter }}
              >{`Results for “${submitted}”`}</Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: theme.layout.gutter }}>
            <ListingCard listing={item} onPress={openListing} />
          </View>
        )}
        ListEmptyComponent={
          submitted && search.isError ? (
            <ErrorState
              title="Search failed"
              description={
                search.error instanceof Error ? search.error.message : 'Please try again.'
              }
              retryLabel="Retry"
              onRetry={() => void search.refetch()}
            />
          ) : submitted && !search.isLoading && !search.isFetching ? (
            <EmptyState
              title="No results"
              description="Try a different keyword or browse Explore."
            />
          ) : !submitted ? (
            <View style={{ paddingHorizontal: theme.layout.gutter }}>
              <Text variant="body" color="secondary">
                Enter at least 2 characters to search active listings.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          search.isFetchingNextPage ? (
            <ActivityIndicator style={{ marginVertical: theme.spacing.lg }} color={theme.colors.primary} />
          ) : null
        }
      />
    </View>
  );
}
