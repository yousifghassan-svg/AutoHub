import { profileCompletionPercent } from './profile-completion';

describe('profileCompletionPercent', () => {
  const empty = {
    displayName: null,
    cityId: null,
    firstName: null,
    lastName: null,
    email: null,
    avatarUrl: null,
    avatarMediaId: null,
    dateOfBirth: null,
    preferredLanguage: null,
    sellerType: null,
    bio: null,
    hasNotificationPreferences: false,
  };

  it('returns 0 when nothing is filled', () => {
    expect(profileCompletionPercent(empty)).toBe(0);
  });

  it('returns ~18% for gate fields only (displayName + city)', () => {
    expect(
      profileCompletionPercent({
        ...empty,
        displayName: 'Sara',
        cityId: 'c1',
      }),
    ).toBe(18);
  });

  it('returns 100 when all fields are filled', () => {
    expect(
      profileCompletionPercent({
        displayName: 'Sara Ali',
        cityId: 'c1',
        firstName: 'Sara',
        lastName: 'Ali',
        email: 'sara@example.com',
        avatarUrl: 'https://cdn.example/a.jpg',
        avatarMediaId: 'm1',
        dateOfBirth: '1990-01-01',
        preferredLanguage: 'ar',
        sellerType: 'INDIVIDUAL',
        bio: 'Hello',
        hasNotificationPreferences: true,
      }),
    ).toBe(100);
  });
});
