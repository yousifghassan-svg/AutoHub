import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { I18nManager, useColorScheme, useWindowDimensions } from 'react-native';
import { darkColors, lightColors, type ColorScheme, type ThemeColors } from './colors';
import { breakpoints, getLayout, radii, spacing, type LayoutTokens } from './spacing';
import { fontFamilies, textVariants } from './typography';
import type { AppLocale } from '../i18n/locales';
import { isRtlLocale } from '../i18n/locales';

export type Theme = {
  scheme: ColorScheme;
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  fonts: typeof fontFamilies;
  textVariants: typeof textVariants;
  layout: LayoutTokens;
  isRTL: boolean;
  locale: AppLocale;
  width: number;
  isTablet: boolean;
};

type ThemeContextValue = Theme & {
  setScheme: (scheme: ColorScheme | 'system') => void;
  setLocale: (locale: AppLocale) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export type ThemeProviderProps = {
  children: React.ReactNode;
  /** Force scheme; default follows system. */
  initialScheme?: ColorScheme | 'system';
  initialLocale?: AppLocale;
};

export function ThemeProvider({
  children,
  initialScheme = 'system',
  initialLocale = 'ar',
}: ThemeProviderProps) {
  const system = useColorScheme();
  const { width } = useWindowDimensions();
  const [schemePref, setSchemePref] = useState<ColorScheme | 'system'>(initialScheme);
  const [locale, setLocale] = useState<AppLocale>(initialLocale);

  const scheme: ColorScheme =
    schemePref === 'system' ? (system === 'dark' ? 'dark' : 'light') : schemePref;
  const isRTL = isRtlLocale(locale);

  useEffect(() => {
    I18nManager.allowRTL(true);
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
      // Native RTL flips require a reload in production builds; Expo Go may apply on next mount.
    }
  }, [isRTL]);

  const value = useMemo<ThemeContextValue>(() => {
    const colors = scheme === 'dark' ? darkColors : lightColors;
    return {
      scheme,
      colors,
      spacing,
      radii,
      fonts: fontFamilies,
      textVariants,
      layout: getLayout(width),
      isRTL,
      locale,
      width,
      isTablet: width >= breakpoints.tablet,
      setScheme: setSchemePref,
      setLocale,
    };
  }, [scheme, locale, width, isRTL]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
