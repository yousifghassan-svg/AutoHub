export const palette = {
  brand: {
    50: '#FFF1F3',
    100: '#FFD6DC',
    200: '#FFADB8',
    300: '#FF7A8F',
    400: '#F44763',
    500: '#E31937',
    600: '#B8142C',
    700: '#8F1023',
    800: '#660B19',
    900: '#3D0710',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#F7F7F8',
    100: '#EEEEF0',
    200: '#DCDCE0',
    300: '#B8B8C0',
    400: '#8A8A96',
    500: '#5C5C6A',
    600: '#3F3F4A',
    700: '#2A2A32',
    800: '#1A1A1F',
    900: '#0E0E11',
  },
  success: { DEFAULT: '#1F9D6A', soft: '#E8F7F0' },
  warning: { DEFAULT: '#C98600', soft: '#FFF6E0' },
  error: { DEFAULT: '#E31937', soft: '#FFE8EC' },
  info: { DEFAULT: '#2F6FED', soft: '#EAF1FF' },
} as const;

export type ColorScheme = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textSecondary: string;
  textInverse: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  error: string;
  errorSoft: string;
  info: string;
  infoSoft: string;
  overlay: string;
  skeleton: string;
  skeletonHighlight: string;
};

export const lightColors: ThemeColors = {
  background: palette.neutral[50],
  surface: palette.neutral[0],
  surfaceMuted: palette.neutral[100],
  text: palette.neutral[900],
  textSecondary: palette.neutral[500],
  textInverse: palette.neutral[0],
  border: palette.neutral[200],
  borderStrong: palette.neutral[300],
  primary: palette.brand[500],
  primaryPressed: palette.brand[600],
  primarySoft: palette.brand[50],
  success: palette.success.DEFAULT,
  successSoft: palette.success.soft,
  warning: palette.warning.DEFAULT,
  warningSoft: palette.warning.soft,
  error: palette.error.DEFAULT,
  errorSoft: palette.error.soft,
  info: palette.info.DEFAULT,
  infoSoft: palette.info.soft,
  overlay: 'rgba(14, 14, 17, 0.55)',
  skeleton: palette.neutral[200],
  skeletonHighlight: palette.neutral[100],
};

export const darkColors: ThemeColors = {
  background: palette.neutral[900],
  surface: palette.neutral[800],
  surfaceMuted: palette.neutral[700],
  text: palette.neutral[50],
  textSecondary: palette.neutral[400],
  textInverse: palette.neutral[900],
  border: palette.neutral[700],
  borderStrong: palette.neutral[600],
  primary: palette.brand[400],
  primaryPressed: palette.brand[500],
  primarySoft: '#3A1218',
  success: '#3ECF8E',
  successSoft: '#163528',
  warning: '#E0B24A',
  warningSoft: '#3A2E12',
  error: palette.brand[400],
  errorSoft: '#3A1218',
  info: '#6B95F5',
  infoSoft: '#15233F',
  overlay: 'rgba(0, 0, 0, 0.65)',
  skeleton: palette.neutral[700],
  skeletonHighlight: palette.neutral[600],
};
