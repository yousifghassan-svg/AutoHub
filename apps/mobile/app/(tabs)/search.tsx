import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Chip, EmptyState, Input, Text, useI18n, useTheme } from '@autohub/mobile-ui';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';
import { ListingCard } from '@/features/home/components/ListingCard';
import { useRecentSearches, useRecordListingView } from '@/features/home/hooks/useHomeQueries';
import type { ListingCardModel } from '@/features/home/domain/types';
import { usePlateSearchInfinite } from '@/src/features/plates/hooks/usePlates';
import { useVehicleSearchInfinite } from '@/src/features/vehicles/hooks/useVehicles';
import { marketplaceDetailPath } from '@/src/hooks/useMarketplacePath';
import type { MarketplaceCard, MarketplaceDomain } from '@/src/types/marketplace';

export default function SearchScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const params = useLocalSearchParams<{ domain?: string }>();
  const initialDomain: MarketplaceDomain =
    params.domain === 'PLATE' ? 'PLATE' : 'VEHICLE';

  const [domain, setDomain] = useState<MarketplaceDomain>(initialDomain);
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [prefix, setPrefix] = useState('');
  const [number, setNumber] = useState('');
  const [currencyCode, setCurrencyCode] = useState<'IQD' | 'USD'>('IQD');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const recent = useRecentSearches();
  const recordView = useRecordListingView();
  const minPriceNum = minPrice.trim() ? Number(minPrice) : undefined;
  const maxPriceNum = maxPrice.trim() ? Number(maxPrice) : undefined;

  const vehicles = useVehicleSearchInfinite(
    {
      keyword: submitted || undefined,
      pageSize: 12,
      currencyCode,
      minPrice: Number.isFinite(minPriceNum) ? minPriceNum : undefined,
      maxPrice: Number.isFinite(maxPriceNum) ? maxPriceNum : undefined,
    },
    domain === 'VEHICLE' && submitted.trim().length >= 2,
  );
  const plates = usePlateSearchInfinite(
    {
      keyword: submitted || undefined,
      prefix: prefix || undefined,
      number: number || undefined,
      currencyCode,
      minPrice: Number.isFinite(minPriceNum) ? minPriceNum : undefined,
      maxPrice: Number.isFinite(maxPriceNum) ? maxPriceNum : undefined,
      pageSize: 12,
    },
    domain === 'PLATE' &&
      (submitted.trim().length >= 1 || prefix.trim().length > 0 || number.trim().length > 0),
  );

  const active = domain === 'VEHICLE' ? vehicles : plates;
  const items = useMemo(
    () => active.data?.pages.flatMap((p) => p.items) ?? [],
    [active.data],
  );

  const onSubmit = useCallback(() => {
    setSubmitted(query.trim());
  }, [query]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([recent.refetch(), active.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [recent, active]);

  const openItem = useCallback(
    (item: MarketplaceCard) => {
      void recordView.mutateAsync(item as ListingCardModel);
      router.push(marketplaceDetailPath(item) as never);
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
          if (active.hasNextPage && !active.isFetchingNextPage) {
            void active.fetchNextPage();
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
              <Text variant="h1">{t('search')}</Text>
              <View
                style={{
                  flexDirection: theme.isRTL ? 'row-reverse' : 'row',
                  gap: theme.spacing.sm,
                }}
              >
                <Chip
                  label={t('vehicles')}
                  selected={domain === 'VEHICLE'}
                  onPress={() => {
                    setDomain('VEHICLE');
                    setSubmitted('');
                  }}
                />
                <Chip
                  label={t('plates')}
                  selected={domain === 'PLATE'}
                  onPress={() => {
                    setDomain('PLATE');
                    setSubmitted('');
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: theme.isRTL ? 'row-reverse' : 'row',
                  gap: theme.spacing.sm,
                }}
              >
                <Chip
                  label="IQD"
                  selected={currencyCode === 'IQD'}
                  onPress={() => setCurrencyCode('IQD')}
                />
                <Chip
                  label="USD"
                  selected={currencyCode === 'USD'}
                  onPress={() => setCurrencyCode('USD')}
                />
              </View>
              <View
                style={{
                  flexDirection: theme.isRTL ? 'row-reverse' : 'row',
                  gap: theme.spacing.sm,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Input
                    label={`Min (${currencyCode})`}
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="numeric"
                    placeholder={currencyCode === 'IQD' ? '0' : '0'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label={`Max (${currencyCode})`}
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="numeric"
                    placeholder={currencyCode === 'IQD' ? '200000000' : '200000'}
                  />
                </View>
              </View>

              <Input
                label={domain === 'VEHICLE' ? t('searchVehicles') : t('searchPlates')}
                placeholder={
                  domain === 'VEHICLE' ? 'Make, model, year…' : 'Province, prefix, number…'
                }
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={onSubmit}
                returnKeyType="search"
              />

              {domain === 'PLATE' ? (
                <View
                  style={{
                    flexDirection: theme.isRTL ? 'row-reverse' : 'row',
                    gap: theme.spacing.sm,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Prefix"
                      value={prefix}
                      onChangeText={setPrefix}
                      autoCapitalize="characters"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input label="Number" value={number} onChangeText={setNumber} keyboardType="number-pad" />
                  </View>
                </View>
              ) : null}

              <Pressable onPress={onSubmit}>
                <Text variant="label" color="brand">
                  {domain === 'VEHICLE' ? t('searchVehicles') : t('searchPlates')}
                </Text>
              </Pressable>
            </View>

            {(recent.data?.length ?? 0) > 0 ? (
              <View style={{ gap: theme.spacing.sm }}>
                <Text variant="h3" style={{ paddingHorizontal: theme.layout.gutter }}>
                  Recent
                </Text>
                <View
                  style={{
                    paddingHorizontal: theme.layout.gutter,
                    flexDirection: theme.isRTL ? 'row-reverse' : 'row',
                    flexWrap: 'wrap',
                    gap: theme.spacing.sm,
                  }}
                >
                  {recent.data!.slice(0, 8).map((item) => (
                    <Chip
                      key={item.id}
                      label={item.keyword ?? 'Search'}
                      onPress={() => {
                        const next = item.keyword ?? '';
                        setQuery(next);
                        setSubmitted(next);
                      }}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: theme.layout.gutter }}>
            <ListingCard listing={item as ListingCardModel} onPress={() => openItem(item)} />
          </View>
        )}
        ListEmptyComponent={
          submitted || prefix || number ? (
            active.isLoading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <EmptyState title={t('emptyTitle')} description={t('emptyBody')} />
            )
          ) : (
            <EmptyState
              title={domain === 'VEHICLE' ? t('searchVehicles') : t('searchPlates')}
              description={t('emptyBody')}
            />
          )
        }
        ListFooterComponent={
          active.isFetchingNextPage ? (
            <ActivityIndicator style={{ marginVertical: theme.spacing.lg }} color={theme.colors.primary} />
          ) : null
        }
      />
    </View>
  );
}
