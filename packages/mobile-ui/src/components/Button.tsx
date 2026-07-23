import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const heights = { sm: 36, md: 44, lg: 52 } as const;
  const padX = { sm: theme.spacing.md, md: theme.spacing.lg, lg: theme.spacing.xl };

  const palette = {
    primary: {
      bg: theme.colors.primary,
      bgPressed: theme.colors.primaryPressed,
      text: theme.colors.textInverse,
      border: 'transparent',
    },
    secondary: {
      bg: theme.colors.surface,
      bgPressed: theme.colors.surfaceMuted,
      text: theme.colors.text,
      border: theme.colors.borderStrong,
    },
    ghost: {
      bg: 'transparent',
      bgPressed: theme.colors.primarySoft,
      text: theme.colors.primary,
      border: 'transparent',
    },
    danger: {
      bg: theme.colors.error,
      bgPressed: theme.colors.primaryPressed,
      text: theme.colors.textInverse,
      border: 'transparent',
    },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: Boolean(loading) }}
      disabled={isDisabled}
      style={(state) => {
        const base: StyleProp<ViewStyle> = {
          height: heights[size],
          paddingHorizontal: padX[size],
          borderRadius: theme.radii.md,
          backgroundColor: state.pressed ? palette.bgPressed : palette.bg,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: palette.border,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: theme.isRTL ? 'row-reverse' : 'row',
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
          width: fullWidth ? '100%' : undefined,
        };
        return [base, typeof style === 'function' ? style(state) : style];
      }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <Text variant="label" style={{ color: palette.text }}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
