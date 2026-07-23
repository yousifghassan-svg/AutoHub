import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon, Text, useTheme } from '@autohub/mobile-ui';
import type { IconName } from '@autohub/mobile-ui';

export type QuickAction = {
  key: string;
  label: string;
  icon: IconName;
  onPress: () => void;
};

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.sm, paddingHorizontal: theme.layout.gutter }}>
      <Text variant="h3">Quick actions</Text>
      <View
        style={{
          flexDirection: theme.isRTL ? 'row-reverse' : 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
        }}
      >
        {actions.map((action) => (
          <Pressable
            key={action.key}
            onPress={action.onPress}
            style={{
              width: '47%',
              flexGrow: 1,
              minWidth: 140,
              padding: theme.spacing.lg,
              borderRadius: theme.radii.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              gap: theme.spacing.sm,
              alignItems: theme.isRTL ? 'flex-end' : 'flex-start',
            }}
          >
            <Icon name={action.icon} color={theme.colors.primary} />
            <Text variant="label">{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function RecommendedPlaceholder() {
  const theme = useTheme();
  return (
    <View
      style={{
        marginHorizontal: theme.layout.gutter,
        padding: theme.spacing.xl,
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surfaceMuted,
        gap: theme.spacing.sm,
      }}
    >
      <Text variant="h3">Recommended for you</Text>
      <Text variant="body" color="secondary">
        Personalized recommendations arrive in a later sprint. No AI yet.
      </Text>
    </View>
  );
}
