import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  icon = 'file-tray-outline',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xxl,
        gap: theme.spacing.md,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: theme.radii.full,
          backgroundColor: theme.colors.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={32} color={theme.colors.textSecondary} />
      </View>
      <Text variant="h2" align="center">
        {title}
      </Text>
      {description ? (
        <Text variant="body" color="secondary" align="center">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button onPress={onAction} style={{ marginTop: theme.spacing.sm }}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}
