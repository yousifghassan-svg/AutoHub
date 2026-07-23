export const colors = {
  charcoal: {
    50: '#F5F5F5',
    100: '#E8E8E8',
    200: '#CFCFCF',
    300: '#A8A8A8',
    400: '#7A7A7A',
    500: '#525252',
    600: '#3A3A3C',
    700: '#2C2C2E',
    800: '#1C1C1E',
    900: '#0F0F10',
  },
  signal: {
    DEFAULT: '#E31937',
    dark: '#B8142C',
    light: '#FF4D6A',
  },
  white: '#FFFFFF',
  success: '#22A06B',
  warning: '#E5A000',
  error: '#E31937',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
} as const;

export const typography = {
  title: { fontSize: 24, fontWeight: '700' as const },
  subtitle: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.5 },
} as const;
