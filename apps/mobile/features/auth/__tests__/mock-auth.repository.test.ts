import { createDevAuthRepository } from '../data/auth.repository';
import { createMockPhoneAuthGateway } from '../data/mock-phone-auth.gateway';
import { createMemoryTokenStorage } from '../data/memory-token-storage';
import type { HttpClient } from '@/lib/api/http-client';
import type { AuthenticatedUser, AuthTokens } from '@/lib/api/types';

describe('createDevAuthRepository', () => {
  const phone = '+9647501234567';

  function setup() {
    const storage = createMemoryTokenStorage();
    const phoneAuth = createMockPhoneAuthGateway();
    const incompleteUser: AuthenticatedUser = {
      id: 'user-1',
      firebaseUid: 'dev:+9647501234567',
      phone,
      email: null,
      displayName: null,
      firstName: null,
      lastName: null,
      role: 'USER',
      permissions: ['profile:read', 'profile:write'],
      status: 'ACTIVE',
      preferredLanguage: 'ar',
      cityId: null,
      city: null,
      governorate: null,
      avatarUrl: null,
      avatarMediaId: null,
      dateOfBirth: null,
      identityStatus: 'needs_profile',
      profileCompletionPercent: 0,
      sellerProfile: null,
      notificationPreferences: {
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
      },
    };
    const tokens: AuthTokens = {
      accessToken: 'access.jwt',
      refreshToken: 'refresh.opaque',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: incompleteUser,
    };
    const completeUser: AuthenticatedUser = {
      ...incompleteUser,
      displayName: 'Sara',
      cityId: 'city-1',
      city: {
        id: 'city-1',
        nameEn: 'Baghdad',
        nameAr: 'بغداد',
        nameKu: null,
        governorateId: 'gov-1',
      },
      governorate: {
        id: 'gov-1',
        nameEn: 'Baghdad',
        nameAr: 'بغداد',
        nameKu: null,
      },
      identityStatus: 'authenticated',
    };
    const http = {
      post: jest.fn(async (path: string) => {
        if (path === '/v1/auth/dev-login') return tokens;
        if (path === '/v1/auth/refresh') {
          return {
            ...tokens,
            accessToken: 'access.jwt.rotated',
            refreshToken: 'refresh.opaque.rotated',
          };
        }
        if (path === '/v1/auth/logout') return {};
        throw new Error(`Unexpected POST ${path}`);
      }),
      get: jest.fn(async () => incompleteUser),
      patch: jest.fn(async () => completeUser),
    } as unknown as HttpClient;

    const repo = createDevAuthRepository({ http, storage, phoneAuth });
    return { storage, repo, http, tokens, completeUser };
  }

  it('logs in via /v1/auth/dev-login with OTP and requires profile setup', async () => {
    const { repo, http } = setup();
    const verification = await repo.sendOtp(phone);
    const session = await repo.verifyOtpAndLogin(verification, '123456');

    expect(http.post).toHaveBeenCalledWith(
      '/v1/auth/dev-login',
      { phone },
      false,
    );
    expect(session.user.phone).toBe(phone);
    expect(session.user.identityStatus).toBe('needs_profile');
    expect(session.profileSetupComplete).toBe(false);
    expect(session.accessToken).toBe('access.jwt');
  });

  it('rejects wrong OTP before calling the API', async () => {
    const { repo, http } = setup();
    const verification = await repo.sendOtp(phone);
    await expect(repo.verifyOtpAndLogin(verification, '000000')).rejects.toThrow(
      /Invalid/,
    );
    expect(http.post).not.toHaveBeenCalled();
  });

  it('restores session via /v1/auth/me', async () => {
    const { repo, storage } = setup();
    const verification = await repo.sendOtp(phone);
    await repo.verifyOtpAndLogin(verification, '123456');

    const restored = await repo.restoreSession();
    expect(restored?.user.phone).toBe(phone);
    expect(await storage.load()).not.toBeNull();
  });

  it('rotates tokens on refresh', async () => {
    const { repo } = setup();
    const verification = await repo.sendOtp(phone);
    const first = await repo.verifyOtpAndLogin(verification, '123456');
    const refreshed = await repo.refreshSession();

    expect(refreshed?.accessToken).not.toBe(first.accessToken);
    expect(refreshed?.refreshToken).not.toBe(first.refreshToken);
  });

  it('clears legacy offline mock-access sessions', async () => {
    const { repo, storage } = setup();
    await storage.save({
      accessToken: 'mock-access-legacy',
      refreshToken: 'mock-refresh-legacy',
      accessExpiresAt: Date.now() + 60_000,
      user: {
        id: 'legacy',
        firebaseUid: 'mock',
        phone,
        email: null,
        displayName: null,
        firstName: null,
        lastName: null,
        role: 'USER',
        permissions: [],
        status: 'ACTIVE',
        preferredLanguage: null,
        cityId: null,
        city: null,
        governorate: null,
        avatarUrl: null,
        avatarMediaId: null,
        dateOfBirth: null,
        identityStatus: 'needs_profile',
        profileCompletionPercent: 0,
        sellerProfile: null,
        notificationPreferences: {
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
        },
      },
      profileSetupComplete: false,
    });

    expect(await repo.getSession()).toBeNull();
    expect(await storage.load()).toBeNull();
  });

  it('completes profile setup via PATCH /v1/auth/me and logs out', async () => {
    const { repo, http, completeUser } = setup();
    const verification = await repo.sendOtp(phone);
    await repo.verifyOtpAndLogin(verification, '123456');
    const profiled = await repo.completeProfileSetup({
      displayName: 'Sara',
      cityId: 'city-1',
    });

    expect(http.patch).toHaveBeenCalledWith(
      '/v1/auth/me',
      { displayName: 'Sara', cityId: 'city-1' },
      true,
    );
    expect(profiled.profileSetupComplete).toBe(true);
    expect(profiled.user.identityStatus).toBe('authenticated');
    expect(profiled.user.displayName).toBe(completeUser.displayName);

    await repo.logout();
    expect(await repo.getSession()).toBeNull();
  });
});
