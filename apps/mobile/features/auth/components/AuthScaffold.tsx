import React from 'react';
import { View } from 'react-native';
import { Screen, Text, useTheme } from '@autohub/mobile-ui';
import { OfflineBanner } from './OfflineBanner';

type AuthScaffoldProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AuthScaffold({ title, subtitle, children }: AuthScaffoldProps) {
  const theme = useTheme();

  return (
    <Screen scroll>
      <OfflineBanner />
      <View style={{ gap: theme.spacing.xl, paddingTop: theme.spacing.xl }}>
        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="overline" color="brand">
            AUTOHUB
          </Text>
          <Text variant="h1">{title}</Text>
          {subtitle ? (
            <Text variant="body" color="secondary">
              {subtitle}
            </Text>
          ) : null}
        </View>
        {children}
      </View>
    </Screen>
  );
}
