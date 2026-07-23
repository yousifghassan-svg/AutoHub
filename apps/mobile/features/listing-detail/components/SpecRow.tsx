import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from '@autohub/mobile-ui';
import type { SpecRow as SpecRowModel } from '../domain/types';

export function SpecRow({ label, value }: Pick<SpecRowModel, 'label' | 'value'>) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: theme.isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <Text variant="body" color="secondary" style={{ flex: 1 }}>
        {label}
      </Text>
      <Text variant="label" style={{ flexShrink: 1, textAlign: theme.isRTL ? 'left' : 'right' }}>
        {value}
      </Text>
    </View>
  );
}

export function SpecList({ rows }: { rows: SpecRowModel[] }) {
  const theme = useTheme();
  if (!rows.length) {
    return (
      <Text variant="body" color="secondary">
        No specifications available.
      </Text>
    );
  }
  return (
    <View style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, paddingHorizontal: theme.spacing.lg }}>
      {rows.map((row) => (
        <SpecRow key={row.key} label={row.label} value={row.value} />
      ))}
    </View>
  );
}
