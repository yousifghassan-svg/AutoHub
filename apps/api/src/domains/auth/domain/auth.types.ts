import type { LanguageCode, SellerType, UserRole } from '@autohub/database';
import type { Permission } from './permissions';
import type { IdentityStatus } from './identity-status';

export type AuthenticatedUserCity = {
  id: string;
  nameEn: string;
  nameAr: string;
  nameKu: string | null;
  governorateId: string;
};

export type AuthenticatedUserGovernorate = {
  id: string;
  nameEn: string;
  nameAr: string;
  nameKu: string | null;
};

export type AuthenticatedSellerProfile = {
  type: SellerType;
  displayName: string;
  bio: string | null;
};

export type NotificationPreferences = {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  newMessage: boolean;
  listingApproved: boolean;
  listingRejected: boolean;
  priceChange: boolean;
  favouriteUpdate: boolean;
  dealerReply: boolean;
  system: boolean;
};

export type AuthenticatedUser = {
  id: string;
  firebaseUid: string | null;
  phone: string | null;
  email: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  permissions: Permission[];
  status: string;
  preferredLanguage: LanguageCode | null;
  cityId: string | null;
  city: AuthenticatedUserCity | null;
  governorate: AuthenticatedUserGovernorate | null;
  avatarUrl: string | null;
  avatarMediaId: string | null;
  dateOfBirth: string | null;
  identityStatus: IdentityStatus;
  profileCompletionPercent: number;
  sellerProfile: AuthenticatedSellerProfile | null;
  notificationPreferences: NotificationPreferences;
};

export type AccessTokenPayload = {
  sub: string;
  role: UserRole;
  permissions: Permission[];
  firebaseUid?: string | null;
  phone?: string | null;
};

export type FirebasePhoneIdentity = {
  firebaseUid: string;
  phone: string;
  email?: string | null;
  displayName?: string | null;
};

export type RequestContext = {
  ipAddress?: string;
  userAgent?: string;
};

export type UpdateProfileInput = {
  displayName?: string;
  firstName?: string | null;
  lastName?: string | null;
  cityId?: string;
  preferredLanguage?: LanguageCode | null;
  email?: string | null;
  avatarUrl?: string | null;
  avatarMediaId?: string | null;
  dateOfBirth?: string | null;
  /** Nested seller profile upsert fields */
  sellerType?: SellerType;
  bio?: string | null;
  sellerDisplayName?: string | null;
  notificationPreferences?: Partial<NotificationPreferences>;
};
