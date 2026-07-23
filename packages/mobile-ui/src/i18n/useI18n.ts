import { useTheme } from '../theme/ThemeProvider';
import { messages, t, type MessageKey } from './locales';

export function useI18n() {
  const { locale, setLocale, isRTL } = useTheme();
  return {
    locale,
    setLocale,
    isRTL,
    t: (key: MessageKey) => t(locale, key),
    messages: messages[locale],
  };
}
