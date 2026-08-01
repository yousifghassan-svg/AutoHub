import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Card, Screen, Text, useI18n, useTheme } from '@autohub/mobile-ui';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';
import { useAuth } from '@/features/auth/context/AuthProvider';
import { mapAuthError, useLogoutMutation } from '@/features/auth/hooks/useAuthMutations';
import { MenuRow } from '@/src/components/MenuRow';

export default function ProfileScreen() {
  const theme = useTheme();
  const { t } = useI18n();
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
        <Text variant="h1">{t('profile')}</Text>

        <Card>
          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="h3">{session?.user.displayName ?? 'Member'}</Text>
            <Text variant="body" color="secondary">
              {session?.user.phone}
            </Text>
            {typeof session?.user.profileCompletionPercent === 'number' ? (
              <Text variant="caption" color="secondary">
                Profile {session.user.profileCompletionPercent}% complete
              </Text>
            ) : null}
          </View>
        </Card>

        <View style={{ gap: theme.spacing.sm }}>
          <MenuRow
            icon="person-outline"
            label="Edit profile"
            subtitle="Name · location · seller type · notifications"
            onPress={() => router.push('/profile-edit' as never)}
          />
          <MenuRow
            icon="car-outline"
            label={t('myVehicles')}
            subtitle="Manage vehicle listings"
            onPress={() => router.push('/my-vehicles' as never)}
          />
          <MenuRow
            icon="grid-outline"
            label={t('myPlates')}
            subtitle="Manage plate listings"
            onPress={() => router.push('/my-plates' as never)}
          />
          <MenuRow
            icon="chatbubble-outline"
            label="Messages"
            subtitle="Inbox · unread · archive"
            onPress={() => router.push('/inbox' as never)}
          />
          <MenuRow
            icon="heart-outline"
            label={t('savedItems')}
            onPress={() => router.push('/saved' as never)}
          />
          <MenuRow
            icon="list-outline"
            label="All my listings"
            onPress={() => router.push('/my-listings')}
          />
          <MenuRow
            icon="settings-outline"
            label={t('settings')}
            subtitle={`${t('language')} · ${t('appearance')}`}
            onPress={() => router.push('/settings' as never)}
          />
          <MenuRow
            icon="add-circle-outline"
            label={t('sell')}
            onPress={() => router.push('/sell')}
          />
        </View>

        {logout.isError ? (
          <Text variant="caption" color="error">
            {mapAuthError(logout.error)}
          </Text>
        ) : null}

        <Button variant="danger" fullWidth loading={logout.isPending} onPress={onLogout}>
          {t('logout')}
        </Button>
      </View>
    </Screen>
  );
}
