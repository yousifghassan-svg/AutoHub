import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Share,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { AppBar, EmptyState, ErrorState, Text, useTheme } from '@autohub/mobile-ui';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';
import { safeBack } from '@/lib/navigation';
import { createEmptyVehicleDraft } from '@/src/features/create/domain/vehicle-draft';
import { createEmptyPlateDraft } from '@/src/features/create/domain/plate-draft';
import { vehicleCreateRepo, plateCreateRepo } from '@/src/features/create/di';
import {
  useManageChangeStatus,
  useManageDelete,
  useManageDuplicate,
  useManageInfinite,
} from '../hooks/useManage';
import type { ManagedItem, ManageActionKey, ManageStatusTab } from '../domain/types';
import { ManageActionsSheet } from './ManageActionsSheet';
import { ManageItemCard } from './ManageItemCard';
import { ManageStatusTabs } from './ManageStatusTabs';
import { ManageSkeleton } from './ManageSkeleton';

export function DomainManageScreen({
  domain,
  title,
}: {
  domain: 'VEHICLE' | 'PLATE';
  title: string;
}) {
  const theme = useTheme();
  const [tab, setTab] = useState<ManageStatusTab>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<ManagedItem | null>(null);
  const [manageOpen, setManageOpen] = useState(false);

  const query = useManageInfinite(domain, tab);
  const changeStatus = useManageChangeStatus(domain);
  const softDelete = useManageDelete(domain);
  const duplicate = useManageDuplicate(domain);

  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data],
  );

  const busy = changeStatus.isPending || softDelete.isPending || duplicate.isPending;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [query]);

  const openEdit = async (item: ManagedItem) => {
    if (domain === 'VEHICLE') {
      const draft = createEmptyVehicleDraft();
      draft.listingId = item.id;
      draft.title = item.title;
      draft.description = item.description;
      draft.primaryPrice = item.price != null ? String(item.price) : '';
      draft.currencyCode = item.currencyCode === 'USD' ? 'USD' : 'IQD';
      draft.cityId = item.cityId;
      draft.categoryId = item.categoryId;
      draft.step = 'preview';
      await vehicleCreateRepo().saveDraftLocal(draft);
      router.push({ pathname: '/sell/vehicle', params: { localId: draft.localId } });
      return;
    }
    const draft = createEmptyPlateDraft();
    draft.listingId = item.id;
    draft.title = item.title;
    draft.description = item.description;
    draft.primaryPrice = item.price != null ? String(item.price) : '';
    draft.currencyCode = item.currencyCode === 'USD' ? 'USD' : 'IQD';
    draft.cityId = item.cityId;
    draft.categoryId = item.categoryId;
    draft.step = 'preview';
    await plateCreateRepo().saveDraftLocal(draft);
    router.push({ pathname: '/sell/plate', params: { localId: draft.localId } });
  };

  const onAction = (action: ManageActionKey) => {
    if (!selected) return;
    switch (action) {
      case 'view':
        setManageOpen(false);
        router.push(
          (domain === 'VEHICLE' ? `/vehicle/${selected.id}` : `/plate/${selected.id}`) as never,
        );
        break;
      case 'edit':
        setManageOpen(false);
        void openEdit(selected);
        break;
      case 'share':
        void Share.share({
          message: `${selected.title} — AutoHub`,
          url: `https://autohub.iq/${domain === 'VEHICLE' ? 'vehicles' : 'plates'}/${selected.id}`,
        });
        break;
      case 'duplicate':
        duplicate.mutate(selected, {
          onSuccess: (copy) => {
            setManageOpen(false);
            Alert.alert('Duplicated', 'A new draft was created.', [
              { text: 'OK' },
              {
                text: 'Edit',
                onPress: () => void openEdit(copy),
              },
            ]);
          },
          onError: (e) => Alert.alert('Error', e instanceof Error ? e.message : 'Failed'),
        });
        break;
      case 'republish':
        changeStatus.mutate(
          { id: selected.id, status: 'PENDING', title: selected.title },
          {
            onSuccess: () => {
              setManageOpen(false);
              Alert.alert('Submitted', 'Listing submitted for review.');
            },
            onError: (e) => Alert.alert('Error', e instanceof Error ? e.message : 'Failed'),
          },
        );
        break;
      case 'pause':
        changeStatus.mutate(
          { id: selected.id, status: 'ARCHIVED', title: selected.title },
          {
            onSuccess: () => {
              setManageOpen(false);
              Alert.alert('Paused', 'Listing archived (paused).');
            },
            onError: (e) => Alert.alert('Error', e instanceof Error ? e.message : 'Failed'),
          },
        );
        break;
      case 'activate':
        changeStatus.mutate(
          {
            id: selected.id,
            status: selected.status === 'RESERVED' ? 'ACTIVE' : 'PENDING',
            title: selected.title,
          },
          {
            onSuccess: () => {
              setManageOpen(false);
              Alert.alert('Updated', 'Listing activation requested.');
            },
            onError: (e) => Alert.alert('Error', e instanceof Error ? e.message : 'Failed'),
          },
        );
        break;
      case 'markSold':
        changeStatus.mutate(
          { id: selected.id, status: 'SOLD', title: selected.title },
          {
            onSuccess: () => {
              setManageOpen(false);
              Alert.alert('Sold', 'Listing marked as sold.');
            },
            onError: (e) => Alert.alert('Error', e instanceof Error ? e.message : 'Failed'),
          },
        );
        break;
      case 'delete':
        Alert.alert('Delete listing?', 'This soft-deletes the listing.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () =>
              softDelete.mutate(selected.id, {
                onSuccess: () => {
                  setManageOpen(false);
                  Alert.alert('Deleted', 'Listing removed.');
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
        title={title}
        leadingIcon={theme.isRTL ? 'chevron-forward' : 'chevron-back'}
        onLeadingPress={() => safeBack()}
      />
      <OfflineBanner />
      <View style={{ paddingVertical: theme.spacing.sm }}>
        <ManageStatusTabs value={tab} onChange={setTab} />
      </View>
      {query.isLoading ? (
        <ManageSkeleton />
      ) : query.isError ? (
        <ErrorState
          title="Could not load listings"
          description={query.error instanceof Error ? query.error.message : 'Try again'}
          retryLabel="Retry"
          onRetry={() => void query.refetch()}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: theme.layout.gutter,
            gap: theme.spacing.md,
            paddingBottom: theme.spacing['4xl'],
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
          }
          onEndReached={() => {
            if (query.hasNextPage) void query.fetchNextPage();
          }}
          ListHeaderComponent={
            <Text variant="caption" color="secondary">
              {domain === 'VEHICLE' ? 'GET /v1/vehicles?mine=true' : 'GET /v1/plates?mine=true'}
            </Text>
          }
          renderItem={({ item }) => (
            <ManageItemCard
              item={item}
              onPress={() =>
                router.push(
                  (domain === 'VEHICLE' ? `/vehicle/${item.id}` : `/plate/${item.id}`) as never,
                )
              }
              onManage={() => {
                setSelected(item);
                setManageOpen(true);
              }}
            />
          )}
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon={domain === 'PLATE' ? 'grid-outline' : 'car-sport-outline'}
              title="No listings"
              description="Create a listing to see it here."
              actionLabel="Create"
              onAction={() =>
                router.push(
                  (domain === 'VEHICLE' ? '/sell/vehicle' : '/sell/plate') as never,
                )
              }
            />
          }
        />
      )}
      <ManageActionsSheet
        item={selected}
        visible={manageOpen}
        busy={busy}
        onClose={() => setManageOpen(false)}
        onAction={onAction}
      />
    </View>
  );
}
