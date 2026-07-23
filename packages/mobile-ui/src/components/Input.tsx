import React, { useState } from 'react';
import {
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  helperText?: string;
  errorText?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function Input({
  label,
  helperText,
  errorText,
  containerStyle,
  style,
  editable = true,
  ...rest
}: InputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorText);

  return (
    <View style={[{ gap: theme.spacing.xs, width: '100%' }, containerStyle]}>
      {label ? (
        <Text variant="label" color="secondary">
          {label}
        </Text>
      ) : null}
      <TextInput
        editable={editable}
        accessibilityLabel={label ?? rest.placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          {
            minHeight: 48,
            borderWidth: 1,
            borderColor: hasError
              ? theme.colors.error
              : focused
                ? theme.colors.primary
                : theme.colors.border,
            backgroundColor: editable ? theme.colors.surface : theme.colors.surfaceMuted,
            borderRadius: theme.radii.md,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            color: theme.colors.text,
            fontSize: 16,
            fontFamily: theme.isRTL ? theme.fonts.arabic : theme.fonts.sans,
            textAlign: theme.isRTL ? 'right' : 'left',
            writingDirection: theme.isRTL ? 'rtl' : 'ltr',
          },
          style,
        ]}
        {...rest}
      />
      {hasError ? (
        <Text variant="caption" color="error">
          {errorText}
        </Text>
      ) : helperText ? (
        <Text variant="caption" color="secondary">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
