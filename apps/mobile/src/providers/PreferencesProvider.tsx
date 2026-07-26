import { useTheme } from '@autohub/mobile-ui';
import { useEffect, type ReactNode } from 'react';
import { I18nManager } from 'react-native';
import { usePreferencesStore } from '@/src/features/preferences/preferences.store';

/** Syncs persisted locale/scheme into ThemeProvider + RTL. */
export function PreferencesBridge({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const locale = usePreferencesStore((s) => s.locale);
  const scheme = usePreferencesStore((s) => s.scheme);
  const hydrated = usePreferencesStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    theme.setLocale(locale);
    theme.setScheme(scheme);
    const shouldRtl = locale === 'ar' || locale === 'ku';
    if (I18nManager.isRTL !== shouldRtl) {
      I18nManager.allowRTL(shouldRtl);
      I18nManager.forceRTL(shouldRtl);
    }
  }, [hydrated, locale, scheme]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
