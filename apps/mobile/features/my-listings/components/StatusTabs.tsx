import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text, useTheme } from '@autohub/mobile-ui';
import { STATUS_TABS, type StatusTab } from '../domain/types';

export function StatusTabs({
  value,
  onChange,
}: {
  value: StatusTab;
  onChange: (tab: StatusTab) => void;
}) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: theme.layout.gutter,
        gap: theme.spacing.sm,
        flexDirection: theme.isRTL ? 'row-reverse' : 'row',
      }}
    >
      {STATUS_TABS.map((tab) => {
        const selected = tab.key === value;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(tab.key)}
            style={{
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.radii.full,
              borderWidth: 1,
              borderColor: selected ? theme.colors.primary : theme.colors.border,
              backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
            }}
          >
            <Text variant="label" color={selected ? 'brand' : 'primary'}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
      <View style={{ width: 4 }} />
    </ScrollView>
  );
}
