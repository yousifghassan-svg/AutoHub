import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type StyleProp, type TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { TextVariant } from '../theme/typography';

export type AppTextProps = RNTextProps & {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'inverse' | 'brand' | 'error' | 'success';
  align?: 'auto' | 'left' | 'right' | 'center';
};

export function Text({
  variant = 'body',
  color = 'primary',
  align = 'auto',
  style,
  children,
  ...rest
}: AppTextProps) {
  const theme = useTheme();
  const colorMap = {
    primary: theme.colors.text,
    secondary: theme.colors.textSecondary,
    inverse: theme.colors.textInverse,
    brand: theme.colors.primary,
    error: theme.colors.error,
    success: theme.colors.success,
  } as const;

  const fontFamily = theme.isRTL
    ? variant === 'display' || variant === 'h1' || variant === 'h2' || variant === 'h3'
      ? theme.fonts.arabicBold
      : variant === 'label' || variant === 'overline'
        ? theme.fonts.arabicSemiBold
        : theme.fonts.arabic
    : variant === 'display' || variant === 'h1'
      ? theme.fonts.display
      : variant === 'h2' || variant === 'h3' || variant === 'label' || variant === 'overline'
        ? theme.fonts.sansSemiBold
        : theme.fonts.sans;

  const textAlign =
    align === 'auto' ? (theme.isRTL ? 'right' : 'left') : align;

  const composed: StyleProp<TextStyle> = [
    theme.textVariants[variant],
    {
      color: colorMap[color],
      fontFamily,
      writingDirection: theme.isRTL ? 'rtl' : 'ltr',
      textAlign,
    },
    style,
  ];

  return (
    <RNText style={composed} {...rest}>
      {children}
    </RNText>
  );
}
