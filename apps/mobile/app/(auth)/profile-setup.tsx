import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { Button, Input, Text, useTheme } from '@autohub/mobile-ui';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { useAuth } from '@/features/auth/context/AuthProvider';
import {
  mapAuthError,
  useCompleteProfileMutation,
} from '@/features/auth/hooks/useAuthMutations';
import { profileFormSchema, type ProfileFormValues } from '@/features/auth/domain/schemas';

export default function ProfileSetupScreen() {
  const theme = useTheme();
  const { session, status } = useAuth();
  const completeProfile = useCompleteProfileMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { displayName: session?.user.displayName ?? '' },
  });

  if (status === 'unauthenticated') {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await completeProfile.mutateAsync(values.displayName);
      router.replace('/(tabs)');
    } catch {
      // surfaced below
    }
  });

  return (
    <AuthScaffold
      title="Set up your profile"
      subtitle="Choose how other buyers and sellers will see you. You can change this later."
    >
      <View style={{ gap: theme.spacing.lg }}>
        {session?.user.phone ? (
          <Text variant="caption" color="secondary">
            Signed in as {session.user.phone}
          </Text>
        ) : null}

        <Controller
          control={control}
          name="displayName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Display name"
              placeholder="Your name"
              autoComplete="name"
              textContentType="name"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              errorText={errors.displayName?.message}
            />
          )}
        />

        {completeProfile.isError ? (
          <Text variant="caption" color="error">
            {mapAuthError(completeProfile.error)}
          </Text>
        ) : null}

        <Button fullWidth loading={completeProfile.isPending} onPress={onSubmit}>
          Save & continue
        </Button>
      </View>
    </AuthScaffold>
  );
}
