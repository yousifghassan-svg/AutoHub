import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { AppBar, Button, EmptyState, Screen, Text, useTheme } from '@autohub/mobile-ui';
import { safeBack } from '@/lib/navigation';
import { vehicleCreateRepo, plateCreateRepo } from '@/src/features/create/di';
import type { VehicleDraft } from '@/src/features/create/domain/vehicle-draft';
import type { PlateDraft } from '@/src/features/create/domain/plate-draft';
import { VEHICLE_STEP_LABELS } from '@/src/features/create/domain/vehicle-draft';
import { PLATE_STEP_LABELS } from '@/src/features/create/domain/plate-draft';

export default function SellHubScreen() {
  const theme = useTheme();
  const [vehicleDrafts, setVehicleDrafts] = useState<VehicleDraft[]>([]);
  const [plateDrafts, setPlateDrafts] = useState<PlateDraft[]>([]);

  const reload = async () => {
    const [v, p] = await Promise.all([
      vehicleCreateRepo().listDrafts(),
      plateCreateRepo().listDrafts(),
    ]);
    setVehicleDrafts(v.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    setPlateDrafts(p.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  };

  useEffect(() => {
    void reload();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBar
        title="Sell"
        leadingIcon={theme.isRTL ? 'chevron-forward' : 'chevron-back'}
        onLeadingPress={() => safeBack()}
      />
      <Screen scroll>
        <View style={{ gap: theme.spacing.lg }}>
          <Text variant="body" color="secondary">
            Create Vehicle or Plate listings. Drafts autosave offline and can be resumed anytime.
          </Text>

          <Button fullWidth onPress={() => router.push('/sell/vehicle' as never)}>
            New vehicle listing
          </Button>
          <Button
            fullWidth
            variant="secondary"
            onPress={() => router.push('/sell/plate' as never)}
          >
            New plate listing
          </Button>

          <Text variant="h3">Vehicle drafts</Text>
          {vehicleDrafts.length === 0 ? (
            <EmptyState
              icon="car-sport-outline"
              title="No vehicle drafts"
              description="Start a vehicle wizard to autosave progress."
            />
          ) : (
            vehicleDrafts.map((d) => (
              <Pressable
                key={d.localId}
                onPress={() =>
                  router.push({ pathname: '/sell/vehicle', params: { localId: d.localId } })
                }
                style={{
                  padding: theme.spacing.lg,
                  borderRadius: theme.radii.lg,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  gap: 4,
                }}
              >
                <Text variant="label">
                  {d.title || `${d.brandLabel} ${d.modelLabel}`.trim() || 'Untitled vehicle'}
                </Text>
                <Text variant="caption" color="secondary">
                  {VEHICLE_STEP_LABELS[d.step]} · {d.status}
                </Text>
              </Pressable>
            ))
          )}

          <Text variant="h3">Plate drafts</Text>
          {plateDrafts.length === 0 ? (
            <EmptyState
              icon="grid-outline"
              title="No plate drafts"
              description="Start a plate wizard to autosave progress."
            />
          ) : (
            plateDrafts.map((d) => (
              <Pressable
                key={d.localId}
                onPress={() =>
                  router.push({ pathname: '/sell/plate', params: { localId: d.localId } })
                }
                style={{
                  padding: theme.spacing.lg,
                  borderRadius: theme.radii.lg,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  gap: 4,
                }}
              >
                <Text variant="label">
                  {d.title ||
                    `${d.regionCode} ${d.series} ${d.number}`.trim() ||
                    'Untitled plate'}
                </Text>
                <Text variant="caption" color="secondary">
                  {PLATE_STEP_LABELS[d.step]} · {d.status}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </Screen>
    </View>
  );
}
