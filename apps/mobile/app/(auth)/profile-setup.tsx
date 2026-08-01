import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router } from 'expo-router';
import { useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import { Button, Input, Text, useTheme } from '@autohub/mobile-ui';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { useAuth } from '@/features/auth/context/AuthProvider';
import {
  mapAuthError,
  useCompleteProfileMutation,
} from '@/features/auth/hooks/useAuthMutations';
import { profileFormSchema, type ProfileFormValues } from '@/features/auth/domain/schemas';
import { OptionPicker } from '@/src/features/create/components/OptionPicker';
import { useCatalogFilters } from '@/src/features/catalog/hooks/useCatalog';

export default function ProfileSetupScreen() {
  const theme = useTheme();
  const { session, status } = useAuth();
  const catalog = useCatalogFilters();
  const completeProfile = useCompleteProfileMutation();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: session?.user.displayName ?? '',
      governorateId: session?.user.governorate?.id ?? '',
      cityId: session?.user.cityId ?? '',
      preferredLanguage: session?.user.preferredLanguage ?? '',
      email: session?.user.email ?? '',
      dateOfBirth: session?.user.dateOfBirth ?? '',
      avatarUrl: session?.user.avatarUrl ?? '',
    },
  });

  const governorateId = useWatch({ control, name: 'governorateId' });
  const cityId = useWatch({ control, name: 'cityId' });
  const preferredLanguage = useWatch({ control, name: 'preferredLanguage' });

  const governorates = useMemo(
    () =>
      (catalog.data?.governorates ?? []).map((g) => ({
        id: g.id,
        label: g.nameEn,
        subtitle: g.nameAr,
      })),
    [catalog.data?.governorates],
  );

  const cities = useMemo(
    () =>
      (catalog.data?.cities ?? [])
        .filter((c) => !governorateId || c.governorateId === governorateId)
        .map((c) => ({
          id: c.id,
          label: c.nameEn,
          subtitle: c.nameAr,
        })),
    [catalog.data?.cities, governorateId],
  );

  if (status === 'unauthenticated') {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await completeProfile.mutateAsync({
        displayName: values.displayName,
        cityId: values.cityId,
        preferredLanguage: values.preferredLanguage || undefined,
        email: values.email || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        avatarUrl: values.avatarUrl || undefined,
      });
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
      <ScrollView contentContainerStyle={{ gap: theme.spacing.lg }}>
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

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="label">Governorate</Text>
          <OptionPicker
            options={governorates}
            selectedId={governorateId}
            onSelect={(item) => {
              setValue('governorateId', item.id, { shouldValidate: true });
              setValue('cityId', '', { shouldValidate: true });
            }}
          />
          {errors.governorateId ? (
            <Text variant="caption" color="error">
              {errors.governorateId.message}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="label">City</Text>
          <OptionPicker
            options={cities}
            selectedId={cityId}
            onSelect={(item) => setValue('cityId', item.id, { shouldValidate: true })}
          />
          {errors.cityId ? (
            <Text variant="caption" color="error">
              {errors.cityId.message}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="label">Preferred language (optional)</Text>
          <OptionPicker
            options={[
              { id: '_default', label: 'Default' },
              { id: 'ar', label: 'Arabic' },
              { id: 'ku', label: 'Kurdish' },
              { id: 'en', label: 'English' },
            ]}
            selectedId={preferredLanguage || '_default'}
            onSelect={(item) =>
              setValue(
                'preferredLanguage',
                (item.id === '_default' ? '' : item.id) as ProfileFormValues['preferredLanguage'],
                { shouldValidate: true },
              )
            }
          />
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email (optional)"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              errorText={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="dateOfBirth"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Date of birth (optional)"
              placeholder="YYYY-MM-DD"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              errorText={errors.dateOfBirth?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="avatarUrl"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Profile picture URL (optional)"
              autoCapitalize="none"
              placeholder="https://"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              errorText={errors.avatarUrl?.message}
            />
          )}
        />

        {completeProfile.isError ? (
          <Text variant="caption" color="error">
            {mapAuthError(completeProfile.error)}
          </Text>
        ) : null}

        <Button
          fullWidth
          loading={completeProfile.isPending || catalog.isLoading}
          onPress={onSubmit}
        >
          Save & continue
        </Button>
      </ScrollView>
    </AuthScaffold>
  );
}
