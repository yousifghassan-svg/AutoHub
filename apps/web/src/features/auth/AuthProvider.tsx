'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { config } from '@/lib/config';
import { getHttpClient, getTokenStorage } from '@/lib/api/client';
import {
  createApiAuthRepository,
  createMockAuthRepository,
  type AuthRepository,
} from './data/auth.repository';
import {
  clearVerification,
  loadVerification,
  saveVerification,
} from './data/verification-storage';
import type { AuthStatus, PhoneVerificationSession, StoredSession } from './domain/types';

type AuthContextValue = {
  status: AuthStatus;
  session: StoredSession | null;
  verification: PhoneVerificationSession | null;
  error: string | null;
  clearError: () => void;
  sendOtp: (phone: string) => Promise<PhoneVerificationSession>;
  verifyOtp: (code: string) => Promise<StoredSession>;
  completeProfile: (displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  authMode: 'mock' | 'api';
};

const AuthContext = createContext<AuthContextValue | null>(null);

function deriveStatus(session: StoredSession | null, bootstrapping: boolean): AuthStatus {
  if (bootstrapping) return 'bootstrapping';
  if (!session) return 'unauthenticated';
  if (!session.profileSetupComplete) return 'needs_profile';
  return 'authenticated';
}

function createRepo(): AuthRepository {
  const storage = getTokenStorage();
  const http = getHttpClient();
  if (config.authMode === 'api') {
    return createApiAuthRepository({
      http,
      storage,
      getIdToken: async () => {
        throw new Error(
          'API auth mode requires Firebase Web phone auth. Set NEXT_PUBLIC_AUTH_MODE=mock for local Alpha.',
        );
      },
    });
  }
  return createMockAuthRepository(storage, http);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const repo = useMemo(() => createRepo(), []);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [verification, setVerification] = useState<PhoneVerificationSession | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const restored = await repo.restoreSession();
        if (!cancelled) {
          setSession(restored);
          const pending = loadVerification();
          if (pending) setVerification(pending);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Session restore failed');
          setSession(null);
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    const onFail = () => {
      setSession(null);
      setVerification(null);
      clearVerification();
      queryClient.clear();
    };
    window.addEventListener('autohub:auth-failure', onFail);
    return () => {
      cancelled = true;
      window.removeEventListener('autohub:auth-failure', onFail);
    };
  }, [repo, queryClient]);

  const sendOtp = useCallback(
    async (phone: string) => {
      setError(null);
      const next = await repo.sendOtp(phone);
      setVerification(next);
      saveVerification(next);
      return next;
    },
    [repo],
  );

  const verifyOtp = useCallback(
    async (code: string) => {
      setError(null);
      const active = verification ?? loadVerification();
      if (!active) throw new Error('Start phone verification first');
      const next = await repo.verifyOtpAndLogin(active, code);
      setSession(next);
      setVerification(null);
      clearVerification();
      await queryClient.invalidateQueries();
      return next;
    },
    [repo, verification, queryClient],
  );

  const completeProfile = useCallback(
    async (displayName: string) => {
      setError(null);
      const next = await repo.completeProfileSetup(displayName);
      setSession(next);
    },
    [repo],
  );

  const logout = useCallback(async () => {
    setError(null);
    await repo.logout();
    setSession(null);
    setVerification(null);
    clearVerification();
    queryClient.clear();
  }, [repo, queryClient]);

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
      authMode: config.authMode,
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
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
