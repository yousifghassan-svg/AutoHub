import { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { ErrorState, Text, useI18n, useTheme } from '@autohub/mobile-ui';
import { useQueryClient } from '@tanstack/react-query';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';
import { CategoriesRow, SearchBarEntry } from '@/features/home/components/CategoriesRow';
import { HomeSkeleton } from '@/features/home/components/HomeSkeleton';
import { QuickActions } from '@/features/home/components/QuickActions';
import {
  refreshHomeQueries,
  useCategories,
  useRecordListingView,
} from '@/features/home/hooks/useHomeQueries';
import { DealersRail } from '@/src/components/DealersRail';
import { MarketplaceRail } from '@/src/components/MarketplaceRail';
import { useFeaturedDealers } from '@/src/features/dealers/hooks/useDealers';
import {
  useFeaturedPlates,
  useNewestPlates,
} from '@/src/features/plates/hooks/usePlates';
import {
  useFeaturedVehicles,
  useNewestVehicles,
} from '@/src/features/vehicles/hooks/useVehicles';
import { marketplaceDetailPath } from '@/src/hooks/useMarketplacePath';
import type { MarketplaceCard } from '@/src/types/marketplace';
import { ApiError } from '@/lib/api/types';

export default function HomeScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const featuredVehicles = useFeaturedVehicles(8);
  const newestVehicles = useNewestVehicles(8);
  const featuredPlates = useFeaturedPlates(8);
  const newestPlates = useNewestPlates(8);
  const dealers = useFeaturedDealers(8);
  const categories = useCategories();
  const recordView = useRecordListingView();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshHomeQueries(qc),
        featuredVehicles.refetch(),
        newestVehicles.refetch(),
        featuredPlates.refetch(),
        newestPlates.refetch(),
        dealers.refetch(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [
    qc,
    featuredVehicles,
    newestVehicles,
    featuredPlates,
    newestPlates,
    dealers,
  ]);

  const openItem = useCallback(
    (item: MarketplaceCard) => {
      void recordView.mutateAsync(item);
      router.push(marketplaceDetailPath(item) as never);
    },
    [recordView],
  );

  const bootLoading =
    featuredVehicles.isLoading &&
    newestVehicles.isLoading &&
    featuredPlates.isLoading &&
    !featuredVehicles.data;

  const fatalError =
    featuredVehicles.isError && newestVehicles.isError && featuredPlates.isError
      ? featuredVehicles.error
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
          title={offline ? 'You are offline' : t('errorTitle')}
          description={
            offline
              ? 'Connect to the internet and pull to refresh.'
              : fatalError instanceof Error
                ? fatalError.message
                : t('errorBody')
          }
          retryLabel={t('retry')}
          onRetry={() => void onRefresh()}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <OfflineBanner />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
        contentContainerStyle={{
          paddingBottom: theme.spacing['4xl'],
          gap: theme.spacing.xl,
          paddingTop: theme.spacing.lg,
        }}
      >
        <View style={{ paddingHorizontal: theme.layout.gutter, gap: theme.spacing.xs }}>
          <Text variant="overline" color="brand">
            AUTOHUB
          </Text>
          <Text variant="h1">{t('home')}</Text>
        </View>

        <SearchBarEntry
          placeholder={`${t('searchVehicles')} · ${t('searchPlates')}`}
          onPress={() => router.push('/(tabs)/search')}
        />

        <CategoriesRow
          categories={categories.data ?? []}
          loading={categories.isLoading}
          onSelect={(cat) =>
            router.push({
              pathname: '/(tabs)/search',
              params: { domain: cat.code === 'PLATE' ? 'PLATE' : 'VEHICLE', category: cat.code },
            })
          }
        />

        <QuickActions
          actions={[
            {
              key: 'vehicles',
              label: t('vehicles'),
              icon: 'car-outline',
              onPress: () =>
                router.push({ pathname: '/(tabs)/search', params: { domain: 'VEHICLE' } }),
            },
            {
              key: 'plates',
              label: t('plates'),
              icon: 'grid-outline',
              onPress: () =>
                router.push({ pathname: '/(tabs)/search', params: { domain: 'PLATE' } }),
            },
            {
              key: 'sell',
              label: t('sell'),
              icon: 'add-circle-outline',
              onPress: () => router.push('/sell'),
            },
            {
              key: 'saved',
              label: t('favorites'),
              icon: 'heart-outline',
              onPress: () => router.push('/saved'),
            },
          ]}
        />

        <MarketplaceRail
          title={t('featuredVehicles')}
          items={featuredVehicles.data ?? []}
          loading={featuredVehicles.isLoading}
          emptyTitle={t('emptyTitle')}
          onPressItem={openItem}
          onSeeAll={() =>
            router.push({ pathname: '/(tabs)/search', params: { domain: 'VEHICLE' } })
          }
        />

        <MarketplaceRail
          title={t('featuredPlates')}
          items={featuredPlates.data ?? []}
          loading={featuredPlates.isLoading}
          emptyTitle={t('emptyTitle')}
          onPressItem={openItem}
          onSeeAll={() =>
            router.push({ pathname: '/(tabs)/search', params: { domain: 'PLATE' } })
          }
        />

        <MarketplaceRail
          title={t('newestVehicles')}
          items={newestVehicles.data ?? []}
          loading={newestVehicles.isLoading}
          onPressItem={openItem}
          onSeeAll={() =>
            router.push({ pathname: '/(tabs)/search', params: { domain: 'VEHICLE' } })
          }
        />

        <MarketplaceRail
          title={t('newestPlates')}
          items={newestPlates.data ?? []}
          loading={newestPlates.isLoading}
          onPressItem={openItem}
          onSeeAll={() =>
            router.push({ pathname: '/(tabs)/search', params: { domain: 'PLATE' } })
          }
        />

        <DealersRail
          title={t('dealers')}
          dealers={dealers.data ?? []}
          loading={dealers.isLoading}
          onPressDealer={(d) => router.push(`/dealer/${d.slug || d.id}` as never)}
        />

        <View style={{ paddingHorizontal: theme.layout.gutter }}>
          <Pressable onPress={() => router.push('/(tabs)/explore')}>
            <Text variant="label" color="brand">
              Explore all →
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
