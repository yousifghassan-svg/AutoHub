import React from 'react';
import { View } from 'react-native';
import { Icon, Text, useTheme } from '@autohub/mobile-ui';

export function Viewer360Placeholder() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surfaceMuted,
        gap: theme.spacing.md,
        padding: theme.spacing.xl,
      }}
    >
      <Icon name="sync-outline" size={48} color={theme.colors.primary} />
      <Text variant="h3" align="center">
        360° viewer
      </Text>
      <Text variant="body" color="secondary" align="center">
        Interactive 360 media arrives in a later sprint. This slot is reserved for the asset.
      </Text>
    </View>
  );
}
