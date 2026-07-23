import React from 'react';
import { View } from 'react-native';
import { AppBar, Button, Text, useTheme } from '@autohub/mobile-ui';
import { progressPercent, STEP_LABELS } from '../domain/steps';
import { useWizard } from '../context/WizardProvider';

export function WizardChrome({
  title,
  onClose,
  children,
  onNext,
  nextLabel = 'Continue',
  showBack = true,
  nextLoading,
}: {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  onNext: () => void;
  nextLabel?: string;
  showBack?: boolean;
  nextLoading?: boolean;
}) {
  const theme = useTheme();
  const { draft, error, dispatch, autosaving } = useWizard();
  const pct = progressPercent(draft.step);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBar
        title={title ?? STEP_LABELS[draft.step]}
        subtitle={`${pct}% · ${autosaving ? 'Saving…' : 'Draft saved'}`}
        leadingIcon={theme.isRTL ? 'chevron-forward' : 'chevron-back'}
        onLeadingPress={onClose}
      />
      <View
        style={{
          height: 4,
          backgroundColor: theme.colors.surfaceMuted,
        }}
      >
        <View
          style={{
            height: 4,
            width: `${pct}%`,
            backgroundColor: theme.colors.primary,
          }}
        />
      </View>
      <View style={{ flex: 1, padding: theme.layout.gutter, gap: theme.spacing.lg }}>
        {children}
        {error ? (
          <Text variant="caption" color="error">
            {error}
          </Text>
        ) : null}
      </View>
      <View
        style={{
          padding: theme.layout.gutter,
          gap: theme.spacing.sm,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          flexDirection: theme.isRTL ? 'row-reverse' : 'row',
        }}
      >
        {showBack && draft.step !== 'category' ? (
          <Button variant="ghost" style={{ flex: 1 }} onPress={() => dispatch({ type: 'BACK' })}>
            Back
          </Button>
        ) : null}
        <Button style={{ flex: 2 }} loading={nextLoading} onPress={onNext}>
          {nextLabel}
        </Button>
      </View>
    </View>
  );
}
