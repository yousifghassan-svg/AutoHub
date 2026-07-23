import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export type LoadingProps = {
  label?: string;
  fullScreen?: boolean;
};

export function Loading({ label, fullScreen = false }: LoadingProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: fullScreen ? 1 : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.xl,
      }}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {label ? (
        <Text variant="body" color="secondary">
          {label}
        </Text>
      ) : null}
    </View>
  );
}
