import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

export type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
};

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  const theme = useTheme();
  const tones = {
    neutral: { bg: theme.colors.surfaceMuted, fg: theme.colors.text },
    brand: { bg: theme.colors.primarySoft, fg: theme.colors.primary },
    success: { bg: theme.colors.successSoft, fg: theme.colors.success },
    warning: { bg: theme.colors.warningSoft, fg: theme.colors.warning },
    error: { bg: theme.colors.errorSoft, fg: theme.colors.error },
    info: { bg: theme.colors.infoSoft, fg: theme.colors.info },
  }[tone];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: tones.bg,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xxs,
        borderRadius: theme.radii.full,
      }}
    >
      <Text variant="caption" style={{ color: tones.fg, fontWeight: '600' }}>
        {children}
      </Text>
    </View>
  );
}
