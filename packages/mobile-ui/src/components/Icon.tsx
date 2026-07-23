import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

/** Ionicons glyph names used across the design system. */
export type IconName = keyof typeof Ionicons.glyphMap;

type IonProps = {
  name: IconName;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
};

/** Avoid dual @types/react JSX mismatches across the monorepo. */
const IonIcon = Ionicons as unknown as React.ComponentType<IonProps>;

export type IconProps = IonProps;

export function Icon({ name, size = 22, color, accessibilityLabel }: IconProps) {
  const theme = useTheme();
  return (
    <IonIcon
      name={name}
      size={size}
      color={color ?? theme.colors.text}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
