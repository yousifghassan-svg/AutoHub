import React from 'react';
import { View } from 'react-native';
import { Skeleton, useTheme } from '@autohub/mobile-ui';

export function HomeSkeleton() {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.xl, paddingVertical: theme.spacing.lg }}>
      <View style={{ paddingHorizontal: theme.layout.gutter }}>
        <Skeleton height={48} radius={theme.radii.md} />
      </View>
      <View style={{ paddingHorizontal: theme.layout.gutter, gap: theme.spacing.sm }}>
        <Skeleton height={20} width="40%" />
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <Skeleton width={88} height={36} radius={999} />
          <Skeleton width={88} height={36} radius={999} />
          <Skeleton width={88} height={36} radius={999} />
        </View>
      </View>
      <View style={{ paddingHorizontal: theme.layout.gutter, gap: theme.spacing.md }}>
        <Skeleton height={20} width="50%" />
        <Skeleton height={150} radius={theme.radii.lg} />
        <Skeleton height={150} radius={theme.radii.lg} />
      </View>
    </View>
  );
}
