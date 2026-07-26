import { useCallback } from 'react';
import { Alert, Pressable, Share, View } from 'react-native';
import { router } from 'expo-router';
import {
  AppBar,
  Badge,
  Button,
  Card,
  ErrorState,
  Loading,
  Text,
  useI18n,
  useTheme,
} from '@autohub/mobile-ui';
import { Image } from 'expo-image';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';
import { formatPrice } from '@/features/home/domain/mappers';
import { safeBack } from '@/lib/navigation';
import { useFavoritesStore } from '@/src/features/favorites/favorites.store';
import { useStartListingChat } from '@/src/features/chat/hooks/useChat';
import type { MarketplaceCard, MarketplaceDomain } from '@/src/types/marketplace';
import { ApiError } from '@/lib/api/types';
import type { UseQueryResult } from '@tanstack/react-query';

export function MarketDetailScreen({
  domain,
  query,
}: {
  domain: MarketplaceDomain;
  query: UseQueryResult<MarketplaceCard, Error>;
}) {
  const theme = useTheme();
  const { t } = useI18n();
  const isFavorite = useFavoritesStore((s) =>
    query.data ? s.isFavorite(query.data.id) : false,
  );
  const toggle = useFavoritesStore((s) => s.toggle);
  const startChat = useStartListingChat();

  const onShare = useCallback(async () => {
    if (!query.data) return;
    await Share.share({
      message: `${query.data.title} — ${formatPrice(query.data.price, query.data.currencyCode)}`,
    });
  }, [query.data]);

  const onMessageSeller = () => {
    if (!query.data) return;
    const item = query.data;
    startChat.mutate(
      {
        listingId: item.id,
        firstMessage: {
          type: 'LISTING_CARD',
          body: item.title,
          payload: {
            listingId: item.id,
            title: item.title,
            price: item.price,
            currencyCode: item.currencyCode,
            imageUrl: item.imageUrl,
            domain,
          },
        },
      },
      {
        onSuccess: (c) => router.push(`/inbox/${c.id}` as never),
        onError: (e) =>
          Alert.alert('Message seller', e instanceof Error ? e.message : 'Could not start chat'),
      },
    );
  };

  if (query.isLoading && !query.data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppBar
          title={domain === 'PLATE' ? t('plates') : t('vehicles')}
          leadingIcon="chevron-back"
          onLeadingPress={() => safeBack()}
        />
        <Loading label={t('loading')} />
      </View>
    );
  }

  if (query.isError || !query.data) {
    const offline = query.error instanceof ApiError && query.error.offline;
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppBar
          title={domain === 'PLATE' ? t('plates') : t('vehicles')}
          leadingIcon="chevron-back"
          onLeadingPress={() => safeBack()}
        />
        <ErrorState
          title={offline ? 'Offline' : t('errorTitle')}
          description={query.error?.message ?? t('errorBody')}
          retryLabel={t('retry')}
          onRetry={() => void query.refetch()}
        />
      </View>
    );
  }

  const item = query.data;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBar
        title={domain === 'PLATE' ? t('plates') : t('vehicles')}
        leadingIcon="chevron-back"
        onLeadingPress={() => safeBack()}
      />
      <OfflineBanner />
      <View style={{ flex: 1, padding: theme.layout.gutter, gap: theme.spacing.lg }}>
        <View
          style={{
            height: 220,
            borderRadius: theme.radii.xl,
            overflow: 'hidden',
            backgroundColor: theme.colors.surfaceMuted,
          }}
        >
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text variant="h2" color="secondary">
                {item.plateDisplay ?? item.title}
              </Text>
            </View>
          )}
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <View
            style={{
              flexDirection: theme.isRTL ? 'row-reverse' : 'row',
              gap: theme.spacing.sm,
              flexWrap: 'wrap',
            }}
          >
            {item.isFeatured ? <Badge tone="brand">Featured</Badge> : null}
            {item.isVerified ? <Badge tone="success">Verified</Badge> : null}
            <Badge>{domain}</Badge>
          </View>
          <Text variant="h1">{item.title}</Text>
          <Text variant="h2" color="brand">
            {formatPrice(item.price, item.currencyCode)}
          </Text>
          <Text variant="body" color="secondary">
            {[item.location, item.year, item.mileageKm != null ? `${item.mileageKm} km` : null, item.plateDisplay]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>

        {domain === 'PLATE' ? (
          <Card>
            <View style={{ gap: theme.spacing.xs }}>
              <Text variant="h3">Plate details</Text>
              <Text variant="body">Display: {item.plateDisplay ?? '—'}</Text>
              <Text variant="caption" color="secondary">
                Province / prefix / number filters available in search.
              </Text>
            </View>
          </Card>
        ) : (
          <Card>
            <View style={{ gap: theme.spacing.xs }}>
              <Text variant="h3">Specifications</Text>
              <Text variant="body">Year: {item.year ?? '—'}</Text>
              <Text variant="body">
                Mileage: {item.mileageKm != null ? `${item.mileageKm.toLocaleString()} km` : '—'}
              </Text>
            </View>
          </Card>
        )}

        <View style={{ gap: theme.spacing.sm }}>
          <Button fullWidth loading={startChat.isPending} onPress={onMessageSeller}>
            Message Seller
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onPress={() => toggle(item)}
          >
            {isFavorite ? 'Remove favorite' : t('favorites')}
          </Button>
          <Button variant="ghost" fullWidth onPress={() => void onShare()}>
            Share
          </Button>
          <Pressable onPress={() => router.push(`/listing/${item.id}`)}>
            <Text variant="caption" color="brand" align="center">
              Open full listing view
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
