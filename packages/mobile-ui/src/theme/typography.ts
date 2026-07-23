import type { TextStyle } from 'react-native';

/**
 * Expressive font pairing:
 * - Latin / English: Outfit
 * - Arabic / Kurdish: IBM Plex Sans Arabic
 * Load via Expo font hooks in the app shell.
 */
export const fontFamilies = {
  display: 'Outfit_700Bold',
  sans: 'Outfit_400Regular',
  sansMedium: 'Outfit_500Medium',
  sansSemiBold: 'Outfit_600SemiBold',
  arabic: 'IBMPlexSansArabic_400Regular',
  arabicMedium: 'IBMPlexSansArabic_500Medium',
  arabicSemiBold: 'IBMPlexSansArabic_600SemiBold',
  arabicBold: 'IBMPlexSansArabic_700Bold',
} as const;

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'caption'
  | 'overline';

export const textVariants: Record<
  TextVariant,
  Pick<TextStyle, 'fontSize' | 'lineHeight' | 'letterSpacing' | 'fontWeight'>
> = {
  display: { fontSize: 34, lineHeight: 40, letterSpacing: -0.5, fontWeight: '700' },
  h1: { fontSize: 28, lineHeight: 34, letterSpacing: -0.3, fontWeight: '700' },
  h2: { fontSize: 22, lineHeight: 28, letterSpacing: -0.2, fontWeight: '600' },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  overline: { fontSize: 11, lineHeight: 14, letterSpacing: 1, fontWeight: '600' },
};
