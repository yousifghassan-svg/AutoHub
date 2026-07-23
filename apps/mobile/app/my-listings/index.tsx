import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { AppBar, EmptyState, ErrorState, Text, useTheme } from '@autohub/mobile-ui';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';
import { safeBack } from '@/lib/navigation';
import { EditListingSheet } from '@/features/my-listings/components/EditListingSheet';
import { ManageActionsSheet, type ManageAction } from '@/features/my-listings/components/ManageActionsSheet';
import { ManagedListingCard } from '@/features/my-listings/components/ManagedListingCard';
import { MyListingsSkeleton } from '@/features/my-listings/components/MyListingsSkeleton';
import { StatsSheet } from '@/features/my-listings/components/StatsSheet';
import { StatusTabs } from '@/features/my-listings/components/StatusTabs';
import {
  useChangeListingStatus,
  useDuplicateListing,
  useMyListingsInfinite,
  useRenewListing,
  useSoftDeleteListing,
  useUpdateListing,
} from '@/features/my-listings/hooks/useMyListings';
import type { ManagedListing, StatusTab } from '@/features/my-listings/domain/types';

export default function MyListingsScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<StatusTab>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<ManagedListing | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const query = useMyListingsInfinite(tab, 20);
  const changeStatus = useChangeListingStatus();
  const softDelete = useSoftDeleteListing();
  const updateListing = useUpdateListing();
  const duplicate = useDuplicateListing();
  const renew = useRenewListing();

  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data],
  );

  const busy =
    changeStatus.isPending ||
    softDelete.isPending ||
    updateListing.isPending ||
    duplicate.isPending ||
    renew.isPending;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [query]);

  const openManage = (listing: ManagedListing) => {
    setSelected(listing);
    setManageOpen(true);
  };

  const runStatus = (status: ManagedListing['status']) => {
    if (!selected) return;
    changeStatus.mutate(
      { id: selected.id, status },
      {
        onSuccess: () => {
          setManageOpen(false);
          Alert.alert('Updated', `Status set to ${status}`);
        },
        onError: (e) => Alert.alert('Error', e instanceof Error ? e.message : 'Failed'),
      },
    );
  };

  const onAction = (action: ManageAction) => {
    if (!selected) return;
    switch (action) {
      case 'view':
        setManageOpen(false);
        router.push(`/listing/${selected.id}`);
        break;
      case 'stats':
        setManageOpen(false);
        setStatsOpen(true);
        break;
      case 'edit':
        setManageOpen(false);
        setEditOpen(true);
        break;
      case 'duplicate':
        duplicate.mutate(selected, {
          onSuccess: (copy) => {
            setManageOpen(false);
            Alert.alert('Duplicated', 'A new DRAFT was created.', [
              { text: 'OK' },
              { text: 'Open', onPress: () => router.push(`/listing/${copy.id}`) },
            ]);
          },
          onError: (e) => Alert.alert('Error', e instanceof Error ? e.message : 'Failed'),
        });
        break;
      case 'renew':
        renew.mutate(selected, {
          onSuccess: (copy) => {
            setManageOpen(false);
            Alert.alert(
              'Renewed',
              'No renew API exists — a fresh DRAFT copy was created.',
              [
                { text: 'OK' },
                { text: 'Open', onPress: () => router.push(`/listing/${copy.id}`) },
              ],
            );
          },
          onError: (e) => Alert.alert('Error', e instanceof Error ? e.message : 'Failed'),
        });
        break;
      case 'submitReview':
        runStatus('PENDING');
        break;
      case 'withdraw':
        runStatus('DRAFT');
        break;
      case 'reserve':
        runStatus('RESERVED');
        break;
      case 'unreserve':
        runStatus('ACTIVE');
        break;
      case 'markSold':
        runStatus('SOLD');
        break;
      case 'archive':
        runStatus('ARCHIVED');
        break;
      case 'delete':
        Alert.alert('Delete listing?', 'Soft-deletes and archives the listing.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () =>
              softDelete.mutate(selected.id, {
                onSuccess: () => {
                  setManageOpen(false);
                  Alert.alert('Deleted', 'Listing was soft-deleted.');
                },
                onError: (e) =>
                  Alert.alert('Error', e instanceof Error ? e.message : 'Failed'),
              }),
          },
        ]);
        break;
      default:
        break;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBar
        title="My listings"
        leadingIcon={theme.isRTL ? 'chevron-forward' : 'chevron-back'}
        onLeadingPress={() => safeBack()}
      />
      <OfflineBanner />

      <View style={{ paddingVertical: theme.spacing.md }}>
        <StatusTabs value={tab} onChange={setTab} />
      </View>

      {query.isLoading && !query.data ? (
        <MyListingsSkeleton />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
          }
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) {
              void query.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          contentContainerStyle={{
            paddingHorizontal: theme.layout.gutter,
            paddingBottom: theme.spacing['4xl'],
            gap: theme.spacing.md,
          }}
          ListHeaderComponent={
            <Text variant="caption" color="secondary">
              Manage drafts, pending, active, reserved, sold, and archived listings.
            </Text>
          }
          renderItem={({ item }) => (
            <ManagedListingCard
              listing={item}
              onPress={() => router.push(`/listing/${item.id}`)}
              onManage={() => openManage(item)}
              onStats={() => {
                setSelected(item);
                setStatsOpen(true);
              }}
            />
          )}
          ListEmptyComponent={
            query.isError ? (
              <ErrorState
                title="Couldn’t load listings"
                description={
                  query.error instanceof Error ? query.error.message : 'Please try again.'
                }
                retryLabel="Retry"
                onRetry={() => void query.refetch()}
              />
            ) : !query.isLoading ? (
              <EmptyState
                icon="albums-outline"
                title="No listings here"
                description="Create a listing or try another status tab."
                actionLabel="Sell"
                onAction={() => router.push('/sell')}
              />
            ) : null
          }
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <ActivityIndicator
                style={{ marginVertical: theme.spacing.lg }}
                color={theme.colors.primary}
              />
            ) : null
          }
        />
      )}

      <ManageActionsSheet
        listing={selected}
        visible={manageOpen}
        busy={busy}
        onClose={() => setManageOpen(false)}
        onAction={onAction}
      />
      <StatsSheet
        listing={selected}
        visible={statsOpen}
        onClose={() => setStatsOpen(false)}
      />
      <EditListingSheet
        listing={selected}
        visible={editOpen}
        loading={updateListing.isPending}
        onClose={() => setEditOpen(false)}
        onSave={(input) => {
          if (!selected) return;
          updateListing.mutate(
            { id: selected.id, input },
            {
              onSuccess: () => {
                setEditOpen(false);
                Alert.alert('Saved', 'Listing updated.');
              },
              onError: (e) =>
                Alert.alert('Error', e instanceof Error ? e.message : 'Failed'),
            },
          );
        }}
      />
    </View>
  );
}
