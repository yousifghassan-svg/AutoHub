import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  AppBar,
  Badge,
  ErrorState,
  Text,
  useTheme,
} from '@autohub/mobile-ui';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';
import { safeBack } from '@/lib/navigation';
import { useRecordListingView } from '@/features/home/hooks/useHomeQueries';
import { formatPrice } from '@/features/home/domain/mappers';
import { ActionBar } from '@/features/listing-detail/components/ActionBar';
import { DetailSkeleton } from '@/features/listing-detail/components/DetailSkeleton';
import { MediaGallery } from '@/features/listing-detail/components/MediaGallery';
import { ReportSheet } from '@/features/listing-detail/components/ReportSheet';
import { SafetyTips } from '@/features/listing-detail/components/SafetyTips';
import { SellerCard } from '@/features/listing-detail/components/SellerCard';
import { SimilarRail } from '@/features/listing-detail/components/SimilarRail';
import { SpecList } from '@/features/listing-detail/components/SpecRow';
import {
  useListingDetail,
  useReportListing,
  useSimilarListings,
} from '@/features/listing-detail/hooks/useListingDetail';
import { ApiError } from '@/lib/api/types';
import { useFavoritesStore } from '@/src/features/favorites/favorites.store';
import { resolveDomain } from '@/src/hooks/useMarketplacePath';

export default function ListingDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const listingId = typeof id === 'string' ? id : '';
  const detailQuery = useListingDetail(listingId);
  const similar = useSimilarListings(detailQuery.data);
  const report = useReportListing();
  const recordView = useRecordListingView();
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (!detailQuery.data) return;
    void recordView.mutateAsync({
      id: detailQuery.data.id,
      slug: detailQuery.data.slug,
      title: detailQuery.data.title,
      price: detailQuery.data.price,
      currencyCode: detailQuery.data.currencyCode,
      location: detailQuery.data.cityName,
      mileageKm: null,
      year: null,
      isVerified: detailQuery.data.isVerified,
      isFeatured: detailQuery.data.isFeatured,
      imageUrl: detailQuery.data.media[0]?.thumbUrl ?? detailQuery.data.media[0]?.url ?? null,
      thumbnailKey: detailQuery.data.media[0]?.thumbnailKey ?? null,
      categoryCode: detailQuery.data.categoryCode,
    });
    // Favorites/recently-viewed should only re-fire when the listing id changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally id-only
  }, [detailQuery.data?.id]);

  const openGallery = useCallback(
    (index: number) => {
      router.push({
        pathname: '/listing/gallery',
        params: { id: listingId, index: String(index) },
      });
    },
    [listingId],
  );

  if (detailQuery.isLoading && !detailQuery.data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppBar title="Listing" leadingIcon="chevron-back" onLeadingPress={() => safeBack()} />
        <DetailSkeleton />
      </View>
    );
  }

  if (detailQuery.isError && !detailQuery.data) {
    const offline = detailQuery.error instanceof ApiError && detailQuery.error.offline;
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppBar title="Listing" leadingIcon="chevron-back" onLeadingPress={() => safeBack()} />
        <ErrorState
          title={offline ? 'You are offline' : 'Could not load listing'}
          description={
            detailQuery.error instanceof Error
              ? detailQuery.error.message
              : 'Please try again.'
          }
          retryLabel="Retry"
          onRetry={() => void detailQuery.refetch()}
        />
      </View>
    );
  }

  const detail = detailQuery.data!;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBar
        title={detail.categoryName}
        leadingIcon={theme.isRTL ? 'chevron-forward' : 'chevron-back'}
        onLeadingPress={() => safeBack()}
      />
      <OfflineBanner />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={detailQuery.isRefetching}
            onRefresh={() => void detailQuery.refetch()}
          />
        }
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
      >
        <MediaGallery media={detail.media} onOpenFullScreen={openGallery} />

        <View style={{ padding: theme.layout.gutter, gap: theme.spacing.lg }}>
          <View style={{ gap: theme.spacing.sm }}>
            <View
              style={{
                flexDirection: theme.isRTL ? 'row-reverse' : 'row',
                flexWrap: 'wrap',
                gap: theme.spacing.sm,
              }}
            >
              {detail.isFeatured ? <Badge tone="brand">Featured</Badge> : null}
              {detail.isVerified ? <Badge tone="success">Verified</Badge> : null}
            </View>
            <Text variant="h1">{detail.title}</Text>
            <Text variant="display" color="brand">
              {formatPrice(detail.price, detail.currencyCode)}
            </Text>
            {detail.secondaryPrice != null && detail.secondaryCurrencyCode ? (
              <Text variant="body" color="secondary">
                ≈ {formatPrice(detail.secondaryPrice, detail.secondaryCurrencyCode)}
              </Text>
            ) : null}
          </View>

          <Section title="Location">
            <Text variant="body">{detail.locationLabel || '—'}</Text>
          </Section>

          <Section title="Vehicle information">
            <Text variant="body" color="secondary">
              {detail.categoryName}
              {detail.publishedAt
                ? ` · Listed ${new Date(detail.publishedAt).toLocaleDateString()}`
                : ''}
              {` · ${detail.viewsCount} views`}
            </Text>
          </Section>

          <Section title="Description">
            <Text variant="body" color="secondary">
              {detail.description || 'No description provided.'}
            </Text>
          </Section>

          <Section title="Specifications">
            <SpecList rows={detail.specs} />
          </Section>

          <Section title="Seller">
            <SellerCard seller={detail.seller} />
          </Section>

          <SafetyTips />

          <Section title="Similar listings">
            <SimilarRail
              items={similar.data ?? []}
              onPress={(nextId) => router.push(`/listing/${nextId}`)}
            />
          </Section>
        </View>
      </ScrollView>

      <ActionBar
        detail={detail}
        onFavorite={() =>
          toggleFavorite({
            id: detail.id,
            slug: detail.slug,
            title: detail.title,
            price: detail.price,
            currencyCode: detail.currencyCode,
            location: detail.cityName,
            mileageKm: null,
            year: null,
            isVerified: detail.isVerified,
            isFeatured: detail.isFeatured,
            imageUrl: detail.media[0]?.thumbUrl ?? detail.media[0]?.url ?? null,
            thumbnailKey: detail.media[0]?.thumbnailKey ?? null,
            categoryCode: detail.categoryCode,
            domain: resolveDomain(detail),
          })
        }
        onReport={() => setReportOpen(true)}
      />

      <ReportSheet
        visible={reportOpen}
        loading={report.isPending}
        onClose={() => setReportOpen(false)}
        onSubmit={(reason) => {
          report.mutate(
            { id: detail.id, reason },
            {
              onSuccess: () => {
                setReportOpen(false);
                Alert.alert('Report queued', 'Thanks — we will review this listing.');
              },
            },
          );
        }}
      />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="h3">{title}</Text>
      {children}
    </View>
  );
}
