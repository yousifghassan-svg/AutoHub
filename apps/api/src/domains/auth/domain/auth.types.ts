import type { LanguageCode, UserRole } from '@autohub/database';
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

export type AuthenticatedUser = {
  id: string;
  firebaseUid: string | null;
  phone: string | null;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  permissions: Permission[];
  status: string;
  preferredLanguage: LanguageCode | null;
  cityId: string | null;
  city: AuthenticatedUserCity | null;
  governorate: AuthenticatedUserGovernorate | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  identityStatus: IdentityStatus;
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
  cityId?: string;
  preferredLanguage?: LanguageCode | null;
  email?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
};
