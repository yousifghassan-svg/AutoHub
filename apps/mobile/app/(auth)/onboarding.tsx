import { router } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button, Text, useI18n, useTheme } from '@autohub/mobile-ui';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { usePreferencesStore } from '@/src/features/preferences/preferences.store';

export default function OnboardingScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const completeOnboarding = usePreferencesStore((s) => s.completeOnboarding);

  return (
    <AuthScaffold title={t('onboardingTitle')} subtitle={t('onboardingBody')}>
      <View style={{ gap: theme.spacing.lg }}>
        <Animated.View entering={FadeInUp.delay(80)} style={{ gap: theme.spacing.sm }}>
          <Text variant="label" color="brand">
            {t('vehicles')} · {t('plates')} · {t('dealers')}
          </Text>
          <Text variant="body" color="secondary">
            Arabic · Kurdish · English · Dark & light mode
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(160)}>
          <Button
            fullWidth
            onPress={() => {
              completeOnboarding();
              router.replace('/(auth)/welcome');
            }}
          >
            {t('getStarted')}
          </Button>
        </Animated.View>
      </View>
    </AuthScaffold>
  );
}
