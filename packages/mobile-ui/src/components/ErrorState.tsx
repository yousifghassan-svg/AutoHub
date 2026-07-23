import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';

export type ErrorStateProps = {
  title: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
}: ErrorStateProps) {
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
          backgroundColor: theme.colors.errorSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="alert-circle-outline" size={32} color={theme.colors.error} />
      </View>
      <Text variant="h2" align="center" color="error">
        {title}
      </Text>
      {description ? (
        <Text variant="body" color="secondary" align="center">
          {description}
        </Text>
      ) : null}
      {retryLabel && onRetry ? (
        <Button variant="secondary" onPress={onRetry} style={{ marginTop: theme.spacing.sm }}>
          {retryLabel}
        </Button>
      ) : null}
    </View>
  );
}
