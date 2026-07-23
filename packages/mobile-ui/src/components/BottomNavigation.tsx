import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type BottomNavItem = {
  key: string;
  label: string;
  icon: IconName;
  iconActive?: IconName;
};

export type BottomNavigationProps = {
  items: BottomNavItem[];
  activeKey: string;
  onChange: (key: string) => void;
};

export function BottomNavigation({ items, activeKey, onChange }: BottomNavigationProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: theme.isRTL ? 'row-reverse' : 'row',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingBottom: theme.spacing.sm,
        paddingTop: theme.spacing.xs,
      }}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        const color = active ? theme.colors.primary : theme.colors.textSecondary;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(item.key)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              paddingVertical: theme.spacing.sm,
            }}
          >
            <Icon name={active ? (item.iconActive ?? item.icon) : item.icon} color={color} />
            <Text variant="caption" style={{ color }}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
