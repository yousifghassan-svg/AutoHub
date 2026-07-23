import React from 'react';
import { View } from 'react-native';
import { Icon, Text, useTheme } from '@autohub/mobile-ui';

const TIPS = [
  'Meet in a public place and inspect the vehicle in daylight.',
  'Never send deposits or transfer money before seeing the vehicle.',
  'Verify ownership documents and VIN before paying.',
];

export function SafetyTips() {
  const theme = useTheme();
  return (
    <View
      style={{
        gap: theme.spacing.md,
        padding: theme.spacing.lg,
        borderRadius: theme.radii.lg,
        backgroundColor: theme.colors.warningSoft,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <View
        style={{
          flexDirection: theme.isRTL ? 'row-reverse' : 'row',
          gap: theme.spacing.sm,
          alignItems: 'center',
        }}
      >
        <Icon name="shield-checkmark-outline" color={theme.colors.warning} />
        <Text variant="h3">Safety tips</Text>
      </View>
      {TIPS.map((tip) => (
        <Text key={tip} variant="bodySmall" color="secondary">
          • {tip}
        </Text>
      ))}
    </View>
  );
}
