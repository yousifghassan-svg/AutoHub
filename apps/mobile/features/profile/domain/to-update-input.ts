import type { UpdateProfileInput } from '@/lib/api/types';
import type { ProfileFormValues } from '@/features/auth/domain/schemas';

export function profileFormToUpdateInput(
  values: ProfileFormValues,
  options?: { clearOptionalEmpty?: boolean },
): UpdateProfileInput {
  const clear = options?.clearOptionalEmpty ?? false;
  const email = values.email.trim();
  const avatarUrl = values.avatarUrl.trim();
  const avatarMediaId = values.avatarMediaId.trim();
  const dob = values.dateOfBirth.trim();
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const bio = values.bio.trim();
  const language = values.preferredLanguage;

  const input: UpdateProfileInput = {
    displayName: values.displayName.trim(),
    cityId: values.cityId,
    preferredLanguage:
      language === 'ar' || language === 'ku' || language === 'en'
        ? language
        : clear
          ? null
          : undefined,
    email: email ? email : clear ? null : undefined,
    dateOfBirth: dob ? dob : clear ? null : undefined,
    firstName: firstName ? firstName : clear ? null : undefined,
    lastName: lastName ? lastName : clear ? null : undefined,
    bio: bio ? bio : clear ? null : undefined,
    notificationPreferences: {
      pushEnabled: values.pushEnabled,
      emailEnabled: values.emailEnabled,
      newMessage: values.newMessage,
      listingApproved: values.listingApproved,
    },
  };

  if (avatarMediaId) {
    input.avatarMediaId = avatarMediaId;
    if (avatarUrl) input.avatarUrl = avatarUrl;
  } else if (avatarUrl) {
    input.avatarUrl = avatarUrl;
  } else if (clear) {
    input.avatarUrl = null;
    input.avatarMediaId = null;
  }

  return input;
}
