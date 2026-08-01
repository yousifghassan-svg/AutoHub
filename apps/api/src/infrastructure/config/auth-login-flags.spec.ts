import {
  resetAuthLoginFlagWarningForTests,
  resolveAuthLoginFlags,
} from './auth-login-flags';

describe('resolveAuthLoginFlags', () => {
  beforeEach(() => {
    resetAuthLoginFlagWarningForTests();
  });

  it('forces both flags false in production even when env enables them', () => {
    expect(
      resolveAuthLoginFlags({
        nodeEnv: 'production',
        authAllowStaffLogin: true,
        authAllowDevLogin: true,
        allowStaffDevLogin: true,
      }),
    ).toEqual({ allowStaffLogin: false, allowDevLogin: false });
  });

  it('defaults both true outside production', () => {
    expect(resolveAuthLoginFlags({ nodeEnv: 'development' })).toEqual({
      allowStaffLogin: true,
      allowDevLogin: true,
    });
  });

  it('honors new flags independently', () => {
    expect(
      resolveAuthLoginFlags({
        nodeEnv: 'development',
        authAllowStaffLogin: true,
        authAllowDevLogin: false,
      }),
    ).toEqual({ allowStaffLogin: true, allowDevLogin: false });
  });

  it('applies legacy ALLOW_STAFF_DEV_LOGIN when new flags are unset', () => {
    expect(
      resolveAuthLoginFlags({
        nodeEnv: 'development',
        allowStaffDevLogin: false,
      }),
    ).toEqual({ allowStaffLogin: false, allowDevLogin: false });
  });

  it('lets new flags override legacy when both are set', () => {
    expect(
      resolveAuthLoginFlags({
        nodeEnv: 'development',
        allowStaffDevLogin: false,
        authAllowStaffLogin: true,
        authAllowDevLogin: true,
      }),
    ).toEqual({ allowStaffLogin: true, allowDevLogin: true });
  });
});
