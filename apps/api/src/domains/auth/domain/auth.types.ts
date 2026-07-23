import type { UserRole } from '@autohub/database';
import type { Permission } from './permissions';

export type AuthenticatedUser = {
  id: string;
  firebaseUid: string | null;
  phone: string | null;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  permissions: Permission[];
  status: string;
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
