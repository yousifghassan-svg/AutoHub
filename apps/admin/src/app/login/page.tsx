'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { STAFF_SEED_ACCOUNTS } from '@/features/auth/domain/types';
import { Button, Input } from '@/components/ui';

export default function LoginPage() {
  const { status, staffLogin, error, clearError, hasAccess } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && hasAccess) {
      router.replace('/dashboard');
    }
  }, [status, hasAccess, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setSubmitting(true);
    try {
      await staffLogin(phone);
      router.replace('/dashboard');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'bootstrapping') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-ink-secondary">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-card">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">Staff portal</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink">AutoHub Admin</h1>
          <p className="mt-2 text-sm text-ink-secondary">
            Sign in with your staff phone number.
          </p>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          <Input
            label="Phone number"
            type="tel"
            autoComplete="tel"
            placeholder="+9647700090001"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          {(localError || error) && (
            <p className="text-sm text-error" role="alert">
              {localError ?? error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
            Seed accounts (local dev)
          </p>
          <div className="flex flex-wrap gap-2">
            {STAFF_SEED_ACCOUNTS.map((acc) => (
              <button
                key={acc.phone}
                type="button"
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink-secondary transition hover:border-brand hover:text-brand"
                onClick={() => setPhone(acc.phone)}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
