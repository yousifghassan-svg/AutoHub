import { z } from 'zod';
import type {
  NotificationPreferences,
  SellerType,
  UpdateProfileInput,
} from '@/lib/api/types';

const optionalName = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .min(1, { message: 'Name must be at least 1 character' })
    .max(80, { message: 'Name must be at most 80 characters' }),
]);

/** Aligns with API UpdateProfileDto + identity completeness (displayName + cityId). */
export const profileFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, { message: 'Display name must be at least 2 characters' })
    .max(80, { message: 'Display name must be at most 80 characters' }),
  firstName: optionalName,
  lastName: optionalName,
  governorateId: z.string().min(1, { message: 'Select a governorate' }),
  cityId: z.string().min(1, { message: 'Select a city' }),
  preferredLanguage: z.enum(['', 'ar', 'ku', 'en']),
  email: z.union([
    z.literal(''),
    z.string().trim().email({ message: 'Enter a valid email address' }),
  ]),
  dateOfBirth: z.union([
    z.literal(''),
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Use YYYY-MM-DD' })
      .refine((value) => {
        const date = new Date(`${value}T00:00:00.000Z`);
        if (Number.isNaN(date.getTime())) return false;
        const now = new Date();
        const ageMs = now.getTime() - date.getTime();
        const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
        return ageYears >= 13 && ageYears <= 120;
      }, { message: 'Age must be between 13 and 120' }),
  ]),
  avatarUrl: z.union([
    z.literal(''),
    z
      .string()
      .trim()
      .url({ message: 'Enter a valid http(s) URL' })
      .refine((v) => /^https?:\/\//i.test(v), {
        message: 'Avatar URL must start with http:// or https://',
      })
      .max(2048, { message: 'Avatar URL is too long' }),
  ]),
  avatarMediaId: z.string(),
  sellerType: z.enum(['INDIVIDUAL', 'DEALER']),
  bio: z.string().max(2000, { message: 'Bio must be at most 2000 characters' }),
  notificationPreferences: z.object({
    pushEnabled: z.boolean(),
    emailEnabled: z.boolean(),
    smsEnabled: z.boolean(),
    newMessage: z.boolean(),
    listingApproved: z.boolean(),
    listingRejected: z.boolean(),
    priceChange: z.boolean(),
    favouriteUpdate: z.boolean(),
    dealerReply: z.boolean(),
    system: z.boolean(),
  }),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  newMessage: true,
  listingApproved: true,
  listingRejected: true,
  priceChange: true,
  favouriteUpdate: true,
  dealerReply: true,
  system: true,
};

export function emptyProfileFormValues(): ProfileFormValues {
  return {
    displayName: '',
    firstName: '',
    lastName: '',
    governorateId: '',
    cityId: '',
    preferredLanguage: '',
    email: '',
    dateOfBirth: '',
    avatarUrl: '',
    avatarMediaId: '',
    sellerType: 'INDIVIDUAL',
    bio: '',
    notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
  };
}

export function profileFormValuesToUpdateInput(
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
  const preferredLanguage: UpdateProfileInput['preferredLanguage'] =
    language === 'ar' || language === 'ku' || language === 'en'
      ? language
      : clear
        ? null
        : undefined;

  const input: UpdateProfileInput = {
    displayName: values.displayName.trim(),
    cityId: values.cityId,
    preferredLanguage,
    email: email ? email : clear ? null : undefined,
    dateOfBirth: dob ? dob : clear ? null : undefined,
    firstName: firstName ? firstName : clear ? null : undefined,
    lastName: lastName ? lastName : clear ? null : undefined,
    sellerType: values.sellerType as SellerType,
    bio: bio ? bio : clear ? null : undefined,
    notificationPreferences: values.notificationPreferences,
  };

  if (avatarMediaId) {
    input.avatarMediaId = avatarMediaId;
    if (avatarUrl) input.avatarUrl = avatarUrl;
  } else if (avatarUrl) {
    input.avatarUrl = avatarUrl;
    if (clear) input.avatarMediaId = null;
  } else if (clear) {
    input.avatarUrl = null;
    input.avatarMediaId = null;
  }

  return input;
}

export function validateProfileForm(
  values: ProfileFormValues,
): { ok: true; values: ProfileFormValues } | { ok: false; message: string } {
  const parsed = profileFormSchema.safeParse(values);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, message: first?.message ?? 'Please check the form' };
  }
  return { ok: true, values: parsed.data };
}
