import React from 'react';
import { Pressable, View } from 'react-native';
import { Text, useTheme } from '@autohub/mobile-ui';

export type OptionItem = {
  id: string;
  title: string;
  subtitle?: string;
};

export function OptionGrid({
  options,
  selectedId,
  onSelect,
}: {
  options: OptionItem[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      {options.map((opt) => {
        const selected = opt.id === selectedId;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onSelect(opt.id)}
            style={{
              padding: theme.spacing.lg,
              borderRadius: theme.radii.lg,
              borderWidth: 1.5,
              borderColor: selected ? theme.colors.primary : theme.colors.border,
              backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
              gap: 4,
            }}
          >
            <Text variant="label" color={selected ? 'brand' : 'primary'}>
              {opt.title}
            </Text>
            {opt.subtitle ? (
              <Text variant="caption" color="secondary">
                {opt.subtitle}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
