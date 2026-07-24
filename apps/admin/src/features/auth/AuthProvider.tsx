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
import { getHttpClient, getTokenStorage } from '@/lib/api/client';
import { createAuthRepository } from './data/auth.repository';
import {
  hasAdminAccess,
  type AuthStatus,
  type StoredSession,
} from './domain/types';

type AuthContextValue = {
  status: AuthStatus;
  session: StoredSession | null;
  error: string | null;
  clearError: () => void;
  staffLogin: (phone: string) => Promise<StoredSession>;
  logout: () => Promise<void>;
  hasAccess: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function deriveStatus(session: StoredSession | null, bootstrapping: boolean): AuthStatus {
  if (bootstrapping) return 'bootstrapping';
  if (!session) return 'unauthenticated';
  return 'authenticated';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const repo = useMemo(
    () => createAuthRepository({ http: getHttpClient(), storage: getTokenStorage() }),
    [],
  );
  const [session, setSession] = useState<StoredSession | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
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
    const onFail = () => {
      setSession(null);
      queryClient.clear();
    };
    window.addEventListener('autohub:auth-failure', onFail);
    return () => {
      cancelled = true;
      window.removeEventListener('autohub:auth-failure', onFail);
    };
  }, [repo, queryClient]);

  const staffLogin = useCallback(
    async (phone: string) => {
      setError(null);
      const next = await repo.staffLogin(phone);
      if (!hasAdminAccess(next.user)) {
        await repo.logout();
        throw new Error('This account does not have admin access.');
      }
      setSession(next);
      await queryClient.invalidateQueries();
      return next;
    },
    [repo, queryClient],
  );

  const logout = useCallback(async () => {
    setError(null);
    await repo.logout();
    setSession(null);
    queryClient.clear();
  }, [repo, queryClient]);

  const hasAccess = hasAdminAccess(session?.user);

  const value = useMemo<AuthContextValue>(
    () => ({
      status: deriveStatus(session, bootstrapping),
      session,
      error,
      clearError: () => setError(null),
      staffLogin,
      logout,
      hasAccess,
    }),
    [session, bootstrapping, error, staffLogin, logout, hasAccess],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
