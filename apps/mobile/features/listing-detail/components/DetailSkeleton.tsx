import React from 'react';
import { View } from 'react-native';
import { Skeleton, useTheme } from '@autohub/mobile-ui';

export function DetailSkeleton() {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.lg }}>
      <Skeleton height={280} radius={0} />
      <View style={{ paddingHorizontal: theme.layout.gutter, gap: theme.spacing.md }}>
        <Skeleton height={28} width="70%" />
        <Skeleton height={22} width="40%" />
        <Skeleton height={16} width="50%" />
        <Skeleton height={100} radius={theme.radii.lg} />
        <Skeleton height={160} radius={theme.radii.lg} />
      </View>
    </View>
  );
}
