import type { ReactNode } from 'react';
import { View } from 'react-native';
import { AppBar, Button, Text, useTheme } from '@autohub/mobile-ui';

export function CreateWizardChrome({
  title,
  subtitle,
  progress,
  onClose,
  onBack,
  onNext,
  nextLabel = 'Continue',
  showBack = true,
  nextLoading,
  error,
  children,
}: {
  title: string;
  subtitle?: string;
  progress: number;
  onClose: () => void;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  showBack?: boolean;
  nextLoading?: boolean;
  error?: string | null;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBar
        title={title}
        subtitle={subtitle}
        leadingIcon={theme.isRTL ? 'chevron-forward' : 'chevron-back'}
        onLeadingPress={onClose}
      />
      <View style={{ height: 4, backgroundColor: theme.colors.surfaceMuted }}>
        <View
          style={{
            height: 4,
            width: `${Math.min(100, Math.max(0, progress))}%`,
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
        {showBack && onBack ? (
          <Button variant="ghost" style={{ flex: 1 }} onPress={onBack}>
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
