import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { AppBar, Button, EmptyState, Screen, Text, useTheme } from '@autohub/mobile-ui';
import { useDraftList } from '@/features/sell/context/WizardProvider';
import { createEmptyDraft } from '@/features/sell/domain/draft-factory';
import { getSellRepository } from '@/features/sell/di';
import { STEP_LABELS } from '@/features/sell/domain/steps';
import { safeBack } from '@/lib/navigation';

export default function SellHubScreen() {
  const theme = useTheme();
  const drafts = useDraftList();

  const startNew = async () => {
    const draft = createEmptyDraft();
    await getSellRepository().saveDraftLocal(draft);
    router.push({ pathname: '/sell/wizard', params: { localId: draft.localId } });
  };

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
            Create a listing. Drafts autosave offline and can be resumed anytime.
          </Text>
          <Button fullWidth onPress={() => void startNew()}>
            Start new listing
          </Button>

          <Text variant="h3">Resume draft</Text>
          {(drafts.data ?? []).length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="No drafts yet"
              description="Your in-progress listings will appear here."
            />
          ) : (
            (drafts.data ?? []).map((d) => (
              <Pressable
                key={d.localId}
                onPress={() =>
                  router.push({ pathname: '/sell/wizard', params: { localId: d.localId } })
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
                <Text variant="label">{d.title || 'Untitled draft'}</Text>
                <Text variant="caption" color="secondary">
                  {d.categoryLabel || 'No category'} · {STEP_LABELS[d.step]} · {d.status}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </Screen>
    </View>
  );
}
