import { View } from 'react-native';
import { AppBar, Card, Chip, Screen, Text, useI18n, useTheme, type AppLocale } from '@autohub/mobile-ui';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';
import { safeBack } from '@/lib/navigation';
import { usePreferencesStore } from '@/src/features/preferences/preferences.store';
import { ensureNotificationPermissions } from '@/src/services/notifications';
import { Button } from '@autohub/mobile-ui';
import { useState } from 'react';

const LOCALES: Array<{ code: AppLocale; label: string }> = [
  { code: 'ar', label: 'العربية' },
  { code: 'ku', label: 'کوردی' },
  { code: 'en', label: 'English' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const locale = usePreferencesStore((s) => s.locale);
  const scheme = usePreferencesStore((s) => s.scheme);
  const setLocale = usePreferencesStore((s) => s.setLocale);
  const setScheme = usePreferencesStore((s) => s.setScheme);
  const [notifMsg, setNotifMsg] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBar title={t('settings')} leadingIcon="chevron-back" onLeadingPress={() => safeBack()} />
      <Screen scroll>
        <OfflineBanner />
        <View style={{ gap: theme.spacing.lg }}>
          <Card>
            <View style={{ gap: theme.spacing.md }}>
              <Text variant="h3">{t('language')}</Text>
              <View
                style={{
                  flexDirection: theme.isRTL ? 'row-reverse' : 'row',
                  flexWrap: 'wrap',
                  gap: theme.spacing.sm,
                }}
              >
                {LOCALES.map((item) => (
                  <Chip
                    key={item.code}
                    label={item.label}
                    selected={locale === item.code}
                    onPress={() => setLocale(item.code)}
                  />
                ))}
              </View>
            </View>
          </Card>

          <Card>
            <View style={{ gap: theme.spacing.md }}>
              <Text variant="h3">{t('appearance')}</Text>
              <View
                style={{
                  flexDirection: theme.isRTL ? 'row-reverse' : 'row',
                  flexWrap: 'wrap',
                  gap: theme.spacing.sm,
                }}
              >
                <Chip
                  label={t('lightMode')}
                  selected={scheme === 'light'}
                  onPress={() => setScheme('light')}
                />
                <Chip
                  label={t('darkMode')}
                  selected={scheme === 'dark'}
                  onPress={() => setScheme('dark')}
                />
                <Chip
                  label={t('systemMode')}
                  selected={scheme === 'system'}
                  onPress={() => setScheme('system')}
                />
              </View>
            </View>
          </Card>

          <Card>
            <View style={{ gap: theme.spacing.md }}>
              <Text variant="h3">{t('inbox')}</Text>
              <Text variant="body" color="secondary">
                Enable push notifications for listing updates (device registration comes later).
              </Text>
              <Button
                variant="secondary"
                onPress={async () => {
                  const ok = await ensureNotificationPermissions();
                  setNotifMsg(ok ? 'Notifications enabled' : 'Permission denied');
                }}
              >
                Enable notifications
              </Button>
              {notifMsg ? (
                <Text variant="caption" color="secondary">
                  {notifMsg}
                </Text>
              ) : null}
            </View>
          </Card>
        </View>
      </Screen>
    </View>
  );
}
