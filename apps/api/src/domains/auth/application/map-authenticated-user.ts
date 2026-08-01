import type { LanguageCode, SellerType, UserRole } from '@autohub/database';
import type {
  AuthenticatedUser,
  NotificationPreferences,
} from '../domain/auth.types';
import { identityStatusForUser } from '../domain/identity-status';
import { profileCompletionPercent } from '../domain/profile-completion';
import { permissionsForRole } from '../domain/permissions';

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

export type UserRowForAuth = {
  id: string;
  firebaseUid: string | null;
  phone: string | null;
  email: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  status: string;
  preferredLanguage: LanguageCode | null;
  cityId: string | null;
  avatarUrl: string | null;
  avatarMediaId: string | null;
  dateOfBirth: Date | null;
  city?: {
    id: string;
    nameEn: string;
    nameAr: string;
    nameKu: string | null;
    governorateId: string;
    governorate?: {
      id: string;
      nameEn: string;
      nameAr: string;
      nameKu: string | null;
    } | null;
  } | null;
  sellerProfile?: {
    type: SellerType;
    displayName: string;
    bio: string | null;
  } | null;
  notificationPreference?: NotificationPreferences | null;
};

export function mapAuthenticatedUser(user: UserRowForAuth): AuthenticatedUser {
  const city = user.city
    ? {
        id: user.city.id,
        nameEn: user.city.nameEn,
        nameAr: user.city.nameAr,
        nameKu: user.city.nameKu,
        governorateId: user.city.governorateId,
      }
    : null;

  const governorate = user.city?.governorate
    ? {
        id: user.city.governorate.id,
        nameEn: user.city.governorate.nameEn,
        nameAr: user.city.governorate.nameAr,
        nameKu: user.city.governorate.nameKu,
      }
    : null;

  const notificationPreferences =
    user.notificationPreference ?? DEFAULT_NOTIFICATION_PREFERENCES;

  const sellerProfile = user.sellerProfile
    ? {
        type: user.sellerProfile.type,
        displayName: user.sellerProfile.displayName,
        bio: user.sellerProfile.bio,
      }
    : null;

  return {
    id: user.id,
    firebaseUid: user.firebaseUid,
    phone: user.phone,
    email: user.email,
    displayName: user.displayName,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    permissions: permissionsForRole(user.role),
    status: user.status,
    preferredLanguage: user.preferredLanguage,
    cityId: user.cityId,
    city,
    governorate,
    avatarUrl: user.avatarUrl,
    avatarMediaId: user.avatarMediaId,
    dateOfBirth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().slice(0, 10)
      : null,
    identityStatus: identityStatusForUser({
      displayName: user.displayName,
      cityId: user.cityId,
    }),
    profileCompletionPercent: profileCompletionPercent({
      displayName: user.displayName,
      cityId: user.cityId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      avatarMediaId: user.avatarMediaId,
      dateOfBirth: user.dateOfBirth,
      preferredLanguage: user.preferredLanguage,
      sellerType: user.sellerProfile?.type ?? null,
      bio: user.sellerProfile?.bio ?? null,
      hasNotificationPreferences: Boolean(user.notificationPreference),
    }),
    sellerProfile,
    notificationPreferences,
  };
}
