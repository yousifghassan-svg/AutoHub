import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { Button, Input, Text, useTheme } from '@autohub/mobile-ui';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { useAuth } from '@/features/auth/context/AuthProvider';
import { mapAuthError, useVerifyOtpMutation } from '@/features/auth/hooks/useAuthMutations';
import { otpFormSchema, type OtpFormValues } from '@/features/auth/domain/schemas';

export default function OtpScreen() {
  const theme = useTheme();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const { verification, status } = useAuth();
  const verifyOtp = useVerifyOtpMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const session = await verifyOtp.mutateAsync(values.code);
      if (!session.profileSetupComplete) {
        router.replace('/(auth)/profile-setup');
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      // surfaced below
    }
  });

  if (!verification && status === 'unauthenticated') {
    return (
      <AuthScaffold title="Verification expired" subtitle="Please request a new code.">
        <Button fullWidth onPress={() => router.replace('/(auth)/login')}>
          Back to phone
        </Button>
      </AuthScaffold>
    );
  }

  return (
    <AuthScaffold
      title="Enter the code"
      subtitle={phone ? `Sent to ${phone}` : 'Check your SMS messages.'}
    >
      <View style={{ gap: theme.spacing.lg }}>
        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="OTP"
              placeholder="6-digit code"
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              errorText={errors.code?.message}
            />
          )}
        />

        {verifyOtp.isError ? (
          <Text variant="caption" color="error">
            {mapAuthError(verifyOtp.error)}
          </Text>
        ) : null}

        <Button fullWidth loading={verifyOtp.isPending} onPress={onSubmit}>
          Verify & continue
        </Button>
        <Button variant="ghost" fullWidth onPress={() => router.back()}>
          Change number
        </Button>
      </View>
    </AuthScaffold>
  );
}
