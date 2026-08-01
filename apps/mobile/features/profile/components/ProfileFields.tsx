import * as ImagePicker from 'expo-image-picker';
import type { Control, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { Button, Input, Text, useTheme } from '@autohub/mobile-ui';
import type { ProfileFormValues } from '@/features/auth/domain/schemas';
import { OptionPicker } from '@/src/features/create/components/OptionPicker';
import { uploadProfileAvatar } from '../data/upload-avatar';
import { useState } from 'react';

type CatalogOption = { id: string; label: string; subtitle?: string };

type Props = {
  control: Control<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
  setValue: UseFormSetValue<ProfileFormValues>;
  watch: UseFormWatch<ProfileFormValues>;
  governorates: CatalogOption[];
  cities: CatalogOption[];
  userId?: string;
  showAdvancedNotifications?: boolean;
};

export function ProfileFields({
  control,
  errors,
  setValue,
  watch,
  governorates,
  cities,
  userId,
  showAdvancedNotifications = true,
}: Props) {
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const governorateId = watch('governorateId');
  const cityId = watch('cityId');
  const preferredLanguage = watch('preferredLanguage');
  const sellerType = watch('sellerType');
  const pushEnabled = watch('pushEnabled');
  const emailEnabled = watch('emailEnabled');
  const newMessage = watch('newMessage');
  const listingApproved = watch('listingApproved');

  const pickAvatar = async () => {
    setUploadError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setUploadError('Photo library permission is required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      const uploaded = await uploadProfileAvatar({
        uri: asset.uri,
        filename: asset.fileName ?? 'avatar.jpg',
        mimeType: asset.mimeType ?? 'image/jpeg',
        userId,
      });
      setValue('avatarMediaId', uploaded.mediaId, { shouldValidate: true });
      if (uploaded.url) {
        setValue('avatarUrl', uploaded.url, { shouldValidate: true });
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Avatar upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Display name"
            placeholder="Your name"
            autoComplete="name"
            textContentType="nickname"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            errorText={errors.displayName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="firstName"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="First name"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            errorText={errors.firstName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="lastName"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Last name"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            errorText={errors.lastName?.message}
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
        <Text variant="label">I am a</Text>
        <OptionPicker
          options={[
            { id: 'INDIVIDUAL', label: 'Private seller' },
            { id: 'DEALER', label: 'Dealer' },
          ]}
          selectedId={sellerType}
          onSelect={(item) =>
            setValue('sellerType', item.id as ProfileFormValues['sellerType'], {
              shouldValidate: true,
            })
          }
        />
      </View>

      <Controller
        control={control}
        name="bio"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Bio"
            placeholder="Tell buyers about yourself"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            multiline
            errorText={errors.bio?.message}
          />
        )}
      />

      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="label">Preferred language</Text>
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
            label="Email"
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
            label="Date of birth"
            placeholder="YYYY-MM-DD"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            errorText={errors.dateOfBirth?.message}
          />
        )}
      />

      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="label">Profile picture</Text>
        <Button variant="secondary" loading={uploading} onPress={() => void pickAvatar()}>
          Upload photo
        </Button>
        <Controller
          control={control}
          name="avatarUrl"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Or image URL"
              autoCapitalize="none"
              placeholder="https://"
              value={value}
              onBlur={onBlur}
              onChangeText={(text) => {
                onChange(text);
                setValue('avatarMediaId', '');
              }}
              errorText={errors.avatarUrl?.message}
            />
          )}
        />
        {uploadError ? (
          <Text variant="caption" color="error">
            {uploadError}
          </Text>
        ) : null}
      </View>

      {showAdvancedNotifications ? (
        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="label">Notifications</Text>
          {(
            [
              ['pushEnabled', pushEnabled, 'Push notifications'],
              ['emailEnabled', emailEnabled, 'Email notifications'],
              ['newMessage', newMessage, 'New messages'],
              ['listingApproved', listingApproved, 'Listing approved'],
            ] as const
          ).map(([key, value, label]) => (
            <Pressable
              key={key}
              onPress={() => setValue(key, !value, { shouldValidate: true })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: theme.spacing.sm,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              <Text variant="body">{label}</Text>
              <Text variant="caption" color="secondary">
                {value ? 'On' : 'Off'}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
