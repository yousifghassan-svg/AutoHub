import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { onAuthFailure } from '@/lib/auth-events';
import { getAuthRepository } from '../di';
import type { UpdateProfileInput } from '@/lib/api/types';
import type { AuthStatus, PhoneVerificationSession, StoredSession } from '../domain/types';

type AuthContextValue = {
  status: AuthStatus;
  session: StoredSession | null;
  verification: PhoneVerificationSession | null;
  error: string | null;
  clearError: () => void;
  sendOtp: (phoneE164: string) => Promise<PhoneVerificationSession>;
  verifyOtp: (code: string) => Promise<StoredSession>;
  completeProfile: (input: UpdateProfileInput) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function deriveStatus(session: StoredSession | null, bootstrapping: boolean): AuthStatus {
  if (bootstrapping) return 'bootstrapping';
  if (!session) return 'unauthenticated';
  const identity = session.user.identityStatus;
  if (identity === 'authenticated' || identity === 'needs_profile') {
    return identity;
  }
  return session.profileSetupComplete ? 'authenticated' : 'needs_profile';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const repo = useMemo(() => getAuthRepository(), []);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [verification, setVerification] = useState<PhoneVerificationSession | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const restored = await repo.restoreSession();
        if (!cancelled) setSession(restored);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Session restore failed');
          setSession(null);
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [repo]);

  // Keep React session in sync when HTTP refresh fails and clears storage.
  useEffect(() => {
    return onAuthFailure(() => {
      setSession(null);
      setVerification(null);
      queryClient.clear();
    });
  }, [queryClient]);

  // Eager refresh when returning to foreground (stale access tokens).
  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'active') {
        void repo.refreshSession().then((next) => {
          setSession(next);
        });
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [repo]);

  const sendOtp = useCallback(
    async (phoneE164: string) => {
      setError(null);
      const next = await repo.sendOtp(phoneE164);
      setVerification(next);
      return next;
    },
    [repo],
  );

  const verifyOtp = useCallback(
    async (code: string) => {
      setError(null);
      if (!verification) {
        throw new Error('Start phone verification first');
      }
      const next = await repo.verifyOtpAndLogin(verification, code);
      setSession(next);
      setVerification(null);
      await queryClient.invalidateQueries();
      return next;
    },
    [repo, verification, queryClient],
  );

  const completeProfile = useCallback(
    async (input: UpdateProfileInput) => {
      setError(null);
      const next = await repo.completeProfileSetup(input);
      setSession(next);
    },
    [repo],
  );

  const logout = useCallback(async () => {
    setError(null);
    await repo.logout();
    setSession(null);
    setVerification(null);
    queryClient.clear();
  }, [repo, queryClient]);

  const refresh = useCallback(async () => {
    const next = await repo.refreshSession();
    setSession(next);
  }, [repo]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status: deriveStatus(session, bootstrapping),
      session,
      verification,
      error,
      clearError: () => setError(null),
      sendOtp,
      verifyOtp,
      completeProfile,
      logout,
      refresh,
    }),
    [
      session,
      bootstrapping,
      verification,
      error,
      sendOtp,
      verifyOtp,
      completeProfile,
      logout,
      refresh,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
