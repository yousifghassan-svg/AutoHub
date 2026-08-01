/**
 * Resolves staff/dev login gates for Release 0.2.
 * Production always disables both (hard reject — env cannot override).
 * Supports legacy ALLOW_STAFF_DEV_LOGIN with a one-time deprecation warning.
 */

export type AuthLoginFlagInput = {
  nodeEnv: string;
  authAllowStaffLogin?: boolean;
  authAllowDevLogin?: boolean;
  /** @deprecated Remove in Release 0.3 */
  allowStaffDevLogin?: boolean;
};

export type AuthLoginFlags = {
  allowStaffLogin: boolean;
  allowDevLogin: boolean;
};

let legacyDeprecationWarned = false;

export function resetAuthLoginFlagWarningForTests(): void {
  legacyDeprecationWarned = false;
}

export function resolveAuthLoginFlags(input: AuthLoginFlagInput): AuthLoginFlags {
  if (input.nodeEnv === 'production') {
    return { allowStaffLogin: false, allowDevLogin: false };
  }

  if (input.allowStaffDevLogin !== undefined && !legacyDeprecationWarned) {
    legacyDeprecationWarned = true;
    console.warn(
      '[autohub] ALLOW_STAFF_DEV_LOGIN is deprecated. Use AUTH_ALLOW_STAFF_LOGIN and AUTH_ALLOW_DEV_LOGIN. ' +
        'The old name will be removed in Release 0.3.',
    );
  }

  const defaultNonProd = true;
  const legacy = input.allowStaffDevLogin;

  return {
    allowStaffLogin: input.authAllowStaffLogin ?? legacy ?? defaultNonProd,
    allowDevLogin: input.authAllowDevLogin ?? legacy ?? defaultNonProd,
  };
}
