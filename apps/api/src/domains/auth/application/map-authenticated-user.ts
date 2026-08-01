import type { LanguageCode, UserRole } from '@autohub/database';
import type { AuthenticatedUser } from '../domain/auth.types';
import { identityStatusForUser } from '../domain/identity-status';
import { permissionsForRole } from '../domain/permissions';

export type UserRowForAuth = {
  id: string;
  firebaseUid: string | null;
  phone: string | null;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  status: string;
  preferredLanguage: LanguageCode | null;
  cityId: string | null;
  avatarUrl: string | null;
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

  return {
    id: user.id,
    firebaseUid: user.firebaseUid,
    phone: user.phone,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    permissions: permissionsForRole(user.role),
    status: user.status,
    preferredLanguage: user.preferredLanguage,
    cityId: user.cityId,
    city,
    governorate,
    avatarUrl: user.avatarUrl,
    dateOfBirth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().slice(0, 10)
      : null,
    identityStatus: identityStatusForUser({
      displayName: user.displayName,
      cityId: user.cityId,
    }),
  };
}
