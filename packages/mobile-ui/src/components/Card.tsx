import React from 'react';
import { Pressable, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export type CardProps = ViewProps & {
  padded?: boolean;
  elevated?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Card({
  children,
  padded = true,
  elevated = false,
  onPress,
  style,
  ...rest
}: CardProps) {
  const theme = useTheme();
  const base: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: padded ? theme.spacing.lg : 0,
    shadowColor: '#000',
    shadowOpacity: elevated ? (theme.scheme === 'dark' ? 0.35 : 0.08) : 0,
    shadowRadius: elevated ? 12 : 0,
    shadowOffset: { width: 0, height: elevated ? 4 : 0 },
    elevation: elevated ? 3 : 0,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [base, { opacity: pressed ? 0.92 : 1 }, style]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[base, style]} {...rest}>
      {children}
    </View>
  );
}
