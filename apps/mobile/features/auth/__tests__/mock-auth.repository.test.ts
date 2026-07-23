import { createMockAuthRepository } from '../data/auth.repository';
import { createMockPhoneAuthGateway } from '../data/mock-phone-auth.gateway';
import { createMemoryTokenStorage } from '../data/memory-token-storage';

describe('createMockAuthRepository', () => {
  const phone = '+9647501234567';

  function setup() {
    const storage = createMemoryTokenStorage();
    const phoneAuth = createMockPhoneAuthGateway();
    const repo = createMockAuthRepository({ storage, phoneAuth });
    return { storage, repo };
  }

  it('logs in with OTP and requires profile setup', async () => {
    const { repo } = setup();
    const verification = await repo.sendOtp(phone);
    const session = await repo.verifyOtpAndLogin(verification, '123456');

    expect(session.user.phone).toBe(phone);
    expect(session.profileSetupComplete).toBe(false);
    expect(session.accessToken).toContain('mock-access');
  });

  it('rejects wrong OTP', async () => {
    const { repo } = setup();
    const verification = await repo.sendOtp(phone);
    await expect(repo.verifyOtpAndLogin(verification, '000000')).rejects.toThrow(/Invalid/);
  });

  it('restores session after restart', async () => {
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
