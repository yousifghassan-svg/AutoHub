import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Text, useTheme } from '@autohub/mobile-ui';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { config } from '@/lib/config';

export default function WelcomeScreen() {
  const theme = useTheme();

  return (
    <AuthScaffold
      title="Buy & sell vehicles across Iraq"
      subtitle="Cars, plates, motorcycles, trucks, and heavy equipment — in Arabic, Kurdish, and English."
    >
      <View style={{ gap: theme.spacing.md }}>
        <Button fullWidth onPress={() => router.push('/(auth)/login')}>
          Continue with phone
        </Button>
        <Text variant="caption" color="secondary" align="center">
          {config.authMode === 'mock'
            ? `Demo mode · use OTP ${config.mockOtpCode}`
            : 'Secured with Firebase phone authentication'}
        </Text>
      </View>
    </AuthScaffold>
  );
}
