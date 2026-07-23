import { Redirect } from 'expo-router';
import { Loading, Screen, Text, useTheme } from '@autohub/mobile-ui';
import { View } from 'react-native';
import { useAuth } from '@/features/auth/context/AuthProvider';
import { config } from '@/lib/config';

/** Splash + session restore gate. */
export default function IndexScreen() {
  const { status } = useAuth();
  const theme = useTheme();

  if (status === 'bootstrapping') {
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
          {config.authMode === 'mock' ? (
            <Text variant="caption" color="secondary">
              Auth mode: mock (OTP {config.mockOtpCode})
            </Text>
          ) : null}
        </View>
      </Screen>
    );
  }

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  if (status === 'needs_profile') {
    return <Redirect href="/(auth)/profile-setup" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
