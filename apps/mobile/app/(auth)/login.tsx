import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { Button, Input, Text, useTheme } from '@autohub/mobile-ui';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { mapAuthError, useSendOtpMutation } from '@/features/auth/hooks/useAuthMutations';
import { phoneFormSchema, type PhoneFormValues } from '@/features/auth/domain/schemas';

export default function LoginScreen() {
  const theme = useTheme();
  const sendOtp = useSendOtpMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: { phone: '+964' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await sendOtp.mutateAsync(values.phone);
      router.push({ pathname: '/(auth)/otp', params: { phone: values.phone } });
    } catch {
      // error surfaced below
    }
  });

  return (
    <AuthScaffold
      title="Phone number"
      subtitle="We will send a one-time code to verify it is you."
    >
      <View style={{ gap: theme.spacing.lg }}>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Phone"
              placeholder="+9647XXXXXXXXX"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              errorText={errors.phone?.message}
            />
          )}
        />

        {sendOtp.isError ? (
          <Text variant="caption" color="error">
            {mapAuthError(sendOtp.error)}
          </Text>
        ) : null}

        <Button fullWidth loading={sendOtp.isPending} onPress={onSubmit}>
          Send code
        </Button>
        <Button variant="ghost" fullWidth onPress={() => router.back()}>
          Back
        </Button>
      </View>
    </AuthScaffold>
  );
}
