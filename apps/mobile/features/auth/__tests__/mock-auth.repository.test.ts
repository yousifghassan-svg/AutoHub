import { createDevAuthRepository } from '../data/auth.repository';
import { createMockPhoneAuthGateway } from '../data/mock-phone-auth.gateway';
import { createMemoryTokenStorage } from '../data/memory-token-storage';
import type { HttpClient } from '@/lib/api/http-client';
import type { AuthTokens } from '@/lib/api/types';

describe('createDevAuthRepository', () => {
  const phone = '+9647501234567';

  function setup() {
    const storage = createMemoryTokenStorage();
    const phoneAuth = createMockPhoneAuthGateway();
    const tokens: AuthTokens = {
      accessToken: 'access.jwt',
      refreshToken: 'refresh.opaque',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: 'user-1',
        firebaseUid: 'dev:+9647501234567',
        phone,
        email: null,
        displayName: null,
        role: 'USER',
        permissions: ['profile:read', 'profile:write'],
        status: 'ACTIVE',
      },
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
      get: jest.fn(async () => tokens.user),
    } as unknown as HttpClient;

    const repo = createDevAuthRepository({ http, storage, phoneAuth });
    return { storage, repo, http, tokens };
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
        role: 'USER',
        permissions: [],
        status: 'ACTIVE',
      },
      profileSetupComplete: false,
    });

    expect(await repo.getSession()).toBeNull();
    expect(await storage.load()).toBeNull();
  });

  it('completes profile setup and logs out', async () => {
    const { repo } = setup();
    const verification = await repo.sendOtp(phone);
    await repo.verifyOtpAndLogin(verification, '123456');
    const profiled = await repo.completeProfileSetup('Sara');

    expect(profiled.profileSetupComplete).toBe(true);
    expect(profiled.user.displayName).toBe('Sara');

    await repo.logout();
    expect(await repo.getSession()).toBeNull();
  });
});
