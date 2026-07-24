import type { AuthenticatedUser } from '@/lib/api/types';

export type AuthStatus = 'bootstrapping' | 'unauthenticated' | 'authenticated';

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: number;
  user: AuthenticatedUser;
};

export const STAFF_SEED_ACCOUNTS = [
  { phone: '+9647700090001', role: 'Super Admin', label: 'SuperAdmin' },
  { phone: '+9647700090002', role: 'Admin', label: 'Admin' },
  { phone: '+9647700090003', role: 'Moderator', label: 'Moderator' },
  { phone: '+9647700090004', role: 'Dealer Manager', label: 'DealerManager' },
  { phone: '+9647700090005', role: 'Support', label: 'Support' },
] as const;

export const ADMIN_ACCESS_PERMISSION = 'admin:access';

export function hasAdminAccess(user: AuthenticatedUser | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return user.permissions.includes(ADMIN_ACCESS_PERMISSION);
}
