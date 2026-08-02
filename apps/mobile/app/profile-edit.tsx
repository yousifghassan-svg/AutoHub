import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router, Stack } from 'expo-router';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { Button, Screen, Text, useTheme } from '@autohub/mobile-ui';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';
import { useAuth } from '@/features/auth/context/AuthProvider';
import {
  mapAuthError,
  useCompleteProfileMutation,
} from '@/features/auth/hooks/useAuthMutations';
import { profileFormSchema, type ProfileFormValues } from '@/features/auth/domain/schemas';
import { ProfileFields } from '@/features/profile/components/ProfileFields';
import { profileFormToUpdateInput } from '@/features/profile/domain/to-update-input';
import { useCatalogFilters } from '@/src/features/catalog/hooks/useCatalog';

export default function ProfileEditScreen() {
  const theme = useTheme();
  const { session, status } = useAuth();
  const catalog = useCatalogFilters();
  const completeProfile = useCompleteProfileMutation();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: session?.user.displayName ?? '',
      firstName: session?.user.firstName ?? '',
      lastName: session?.user.lastName ?? '',
      governorateId: session?.user.governorate?.id ?? '',
      cityId: session?.user.cityId ?? '',
      preferredLanguage: session?.user.preferredLanguage ?? '',
      email: session?.user.email ?? '',
      dateOfBirth: session?.user.dateOfBirth ?? '',
      avatarUrl: session?.user.avatarUrl ?? '',
      avatarMediaId: session?.user.avatarMediaId ?? '',
      bio: session?.user.sellerProfile?.bio ?? '',
      pushEnabled: session?.user.notificationPreferences?.pushEnabled ?? true,
      emailEnabled: session?.user.notificationPreferences?.emailEnabled ?? true,
      newMessage: session?.user.notificationPreferences?.newMessage ?? true,
      listingApproved: session?.user.notificationPreferences?.listingApproved ?? true,
    },
  });

  const governorateId = watch('governorateId');

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
  if (status === 'needs_profile') {
    return <Redirect href="/(auth)/profile-setup" />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await completeProfile.mutateAsync(
        profileFormToUpdateInput(values, { clearOptionalEmpty: true }),
      );
      router.back();
    } catch {
      // surfaced below
    }
  });

  const completion = session?.user.profileCompletionPercent;

  return (
    <>
      <Stack.Screen options={{ title: 'Edit profile' }} />
      <Screen scroll>
        <OfflineBanner />
        <View style={{ gap: theme.spacing.lg, paddingBottom: theme.spacing.xl }}>
          <Text variant="h1">Edit profile</Text>
          {typeof completion === 'number' ? (
            <Text variant="body" color="secondary">
              Profile {completion}% complete
            </Text>
          ) : null}
          {session?.user.phone ? (
            <Text variant="caption" color="secondary">
              Phone {session.user.phone} (read-only)
            </Text>
          ) : null}

          <ProfileFields
            control={control}
            errors={errors}
            setValue={setValue}
            watch={watch}
            governorates={governorates}
            cities={cities}
            userId={session?.user.id}
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
            Save changes
          </Button>
        </View>
      </Screen>
    </>
  );
}
