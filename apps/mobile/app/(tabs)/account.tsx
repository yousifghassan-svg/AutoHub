import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Card, Screen, Text, useTheme } from '@autohub/mobile-ui';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';
import { useAuth } from '@/features/auth/context/AuthProvider';
import { mapAuthError, useLogoutMutation } from '@/features/auth/hooks/useAuthMutations';

export default function ProfileScreen() {
  const theme = useTheme();
  const { session } = useAuth();
  const logout = useLogoutMutation();

  const onLogout = async () => {
    try {
      await logout.mutateAsync();
      router.replace('/(auth)/welcome');
    } catch {
      // provider clears locally
    }
  };

  return (
    <Screen scroll>
      <OfflineBanner />
      <View style={{ gap: theme.spacing.lg }}>
        <Text variant="h1">Profile</Text>

        <Card>
          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="h3">{session?.user.displayName ?? 'Member'}</Text>
            <Text variant="body" color="secondary">
              {session?.user.phone}
            </Text>
          </View>
        </Card>

        <Button fullWidth onPress={() => router.push('/my-listings')}>
          My listings
        </Button>
        <Button variant="secondary" fullWidth onPress={() => router.push('/sell')}>
          Create listing
        </Button>

        {logout.isError ? (
          <Text variant="caption" color="error">
            {mapAuthError(logout.error)}
          </Text>
        ) : null}

        <Button variant="danger" fullWidth loading={logout.isPending} onPress={onLogout}>
          Log out
        </Button>
      </View>
    </Screen>
  );
}
