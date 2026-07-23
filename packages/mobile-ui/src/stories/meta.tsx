import React from 'react';
import type { ComponentType } from 'react';
import { ThemeProvider } from '../theme/ThemeProvider';
import type { AppLocale } from '../i18n/locales';
import type { ColorScheme } from '../theme/colors';

export type StoryArgs = {
  scheme?: ColorScheme;
  locale?: AppLocale;
};

/** CSF decorator — wrap any story in ThemeProvider for light/dark + RTL locales. */
export function withTheme(
  Story: ComponentType,
  args: StoryArgs = {},
): React.ReactElement {
  return (
    <ThemeProvider initialScheme={args.scheme ?? 'light'} initialLocale={args.locale ?? 'en'}>
      <Story />
    </ThemeProvider>
  );
}

export const themeArgTypes = {
  scheme: {
    control: 'inline-radio',
    options: ['light', 'dark'],
  },
  locale: {
    control: 'inline-radio',
    options: ['ar', 'ku', 'en'],
  },
} as const;
