import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type AppBarProps = {
  title: string;
  subtitle?: string;
  leadingIcon?: IconName;
  onLeadingPress?: () => void;
  trailing?: React.ReactNode;
};

export function AppBar({
  title,
  subtitle,
  leadingIcon,
  onLeadingPress,
  trailing,
}: AppBarProps) {
  const theme = useTheme();
  const rowDir = theme.isRTL ? 'row-reverse' : 'row';

  return (
    <View
      style={{
        minHeight: 56,
        paddingHorizontal: theme.layout.gutter,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        flexDirection: rowDir,
        alignItems: 'center',
        gap: theme.spacing.md,
      }}
    >
      {leadingIcon ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            leadingIcon === 'arrow-back' || leadingIcon === 'chevron-back' ? 'Back' : 'Navigate'
          }
          onPress={onLeadingPress}
          hitSlop={8}
          style={{ padding: theme.spacing.xs }}
        >
          <Icon name={leadingIcon} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1, alignItems: theme.isRTL ? 'flex-end' : 'flex-start' }}>
        <Text variant="h3" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="secondary" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}
