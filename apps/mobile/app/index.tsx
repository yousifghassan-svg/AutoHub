import { Redirect } from 'expo-router';
import { Loading, Screen, Text, useTheme } from '@autohub/mobile-ui';
import { View } from 'react-native';
import { useAuth } from '@/features/auth/context/AuthProvider';
import { config } from '@/lib/config';
import { usePreferencesStore } from '@/src/features/preferences/preferences.store';

/** Splash + session restore + onboarding gate. */
export default function IndexScreen() {
  const { status } = useAuth();
  const theme = useTheme();
  const prefsHydrated = usePreferencesStore((s) => s.hydrated);
  const onboardingCompleted = usePreferencesStore((s) => s.onboardingCompleted);

  if (status === 'bootstrapping' || !prefsHydrated) {
    return (
      <Screen>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing.lg,
          }}
        >
          <Text variant="display" color="brand">
            AutoHub
          </Text>
          <Loading label="Restoring session…" />
          {config.authMode === 'dev' ? (
            <Text variant="caption" color="secondary">
              Auth mode: dev (OTP {config.authDevOtp})
            </Text>
          ) : null}
        </View>
      </Screen>
    );
  }

  if (!onboardingCompleted && status === 'unauthenticated') {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  if (status === 'needs_profile') {
    return <Redirect href="/(auth)/profile-setup" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
