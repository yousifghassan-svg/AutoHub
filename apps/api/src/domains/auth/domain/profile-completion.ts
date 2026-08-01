/**
 * Profile completion percentage (0–100).
 * Gating identityStatus remains binary (displayName + cityId) via identity-status.ts.
 */
export type ProfileCompletionInput = {
  displayName: string | null;
  cityId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  avatarUrl: string | null;
  avatarMediaId: string | null;
  dateOfBirth: Date | string | null;
  preferredLanguage: string | null;
  sellerType: string | null;
  bio: string | null;
  hasNotificationPreferences: boolean;
};

const FIELDS: Array<{
  key: keyof ProfileCompletionInput;
  filled: (u: ProfileCompletionInput) => boolean;
}> = [
  {
    key: 'displayName',
    filled: (u) => (u.displayName?.trim().length ?? 0) >= 2,
  },
  { key: 'cityId', filled: (u) => Boolean(u.cityId) },
  {
    key: 'firstName',
    filled: (u) => (u.firstName?.trim().length ?? 0) >= 1,
  },
  {
    key: 'lastName',
    filled: (u) => (u.lastName?.trim().length ?? 0) >= 1,
  },
  {
    key: 'email',
    filled: (u) => Boolean(u.email?.trim()),
  },
  {
    key: 'avatarUrl',
    filled: (u) => Boolean(u.avatarUrl?.trim() || u.avatarMediaId),
  },
  {
    key: 'dateOfBirth',
    filled: (u) => Boolean(u.dateOfBirth),
  },
  {
    key: 'preferredLanguage',
    filled: (u) => Boolean(u.preferredLanguage),
  },
  {
    key: 'sellerType',
    filled: (u) => Boolean(u.sellerType),
  },
  {
    key: 'bio',
    filled: (u) => (u.bio?.trim().length ?? 0) >= 1,
  },
  {
    key: 'hasNotificationPreferences',
    filled: (u) => u.hasNotificationPreferences,
  },
];

export function profileCompletionPercent(user: ProfileCompletionInput): number {
  const filled = FIELDS.filter((f) => f.filled(user)).length;
  return Math.round((filled / FIELDS.length) * 100);
}
