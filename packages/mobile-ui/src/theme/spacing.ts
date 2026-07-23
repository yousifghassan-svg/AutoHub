export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  xxl: 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export type SpacingKey = keyof typeof spacing;

export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type RadiusKey = keyof typeof radii;

/** Responsive breakpoints (logical pixels). */
export const breakpoints = {
  phone: 0,
  phablet: 400,
  tablet: 768,
} as const;

export type LayoutTokens = {
  gutter: number;
  contentMaxWidth: number;
  columns: number;
};

/** Responsive gutters / content width from viewport width. */
export function getLayout(width: number): LayoutTokens {
  const isTablet = width >= breakpoints.tablet;
  const isPhablet = width >= breakpoints.phablet;
  return {
    gutter: isTablet ? spacing.xl : isPhablet ? spacing.lg : spacing.md,
    contentMaxWidth: isTablet ? 720 : 560,
    columns: isTablet ? 2 : 1,
  };
}
