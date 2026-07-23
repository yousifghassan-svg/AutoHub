import React from 'react';
import { View } from 'react-native';
import { Skeleton, useTheme } from '@autohub/mobile-ui';

export function MyListingsSkeleton() {
  const theme = useTheme();
  return (
    <View style={{ padding: theme.layout.gutter, gap: theme.spacing.md }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <Skeleton width={110} height={110} radius={theme.radii.md} />
          <View style={{ flex: 1, gap: theme.spacing.sm }}>
            <Skeleton height={18} width="40%" />
            <Skeleton height={16} width="80%" />
            <Skeleton height={14} width="50%" />
          </View>
        </View>
      ))}
    </View>
  );
}
