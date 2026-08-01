import { identityStatusForUser, isProfileComplete } from './identity-status';

describe('identity-status', () => {
  it('requires displayName (≥2) and cityId for completeness', () => {
    expect(isProfileComplete({ displayName: null, cityId: null })).toBe(false);
    expect(isProfileComplete({ displayName: 'A', cityId: 'c1' })).toBe(false);
    expect(isProfileComplete({ displayName: 'Ab', cityId: null })).toBe(false);
    expect(isProfileComplete({ displayName: '  Ab  ', cityId: 'c1' })).toBe(true);
  });

  it('maps completeness to identityStatus', () => {
    expect(
      identityStatusForUser({ displayName: null, cityId: null }),
    ).toBe('needs_profile');
    expect(
      identityStatusForUser({ displayName: 'Sara', cityId: 'c1' }),
    ).toBe('authenticated');
  });
});
