import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
};

export function Chip({ label, selected = false, onPress, disabled }: ChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radii.full,
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        backgroundColor: selected
          ? theme.colors.primarySoft
          : pressed
            ? theme.colors.surfaceMuted
            : theme.colors.surface,
        opacity: disabled ? 0.5 : 1,
      })}
    >
      <Text variant="label" color={selected ? 'brand' : 'primary'}>
        {label}
      </Text>
    </Pressable>
  );
}
