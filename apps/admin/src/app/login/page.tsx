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
        <p className="text-sm text-ink-secondary">Loading…</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary-soft),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-md animate-fade-in rounded-2xl border border-border bg-surface p-8 shadow-lift">
        <div className="mb-8 text-center">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white shadow-card">
            AH
          </span>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
            Staff portal
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            AutoHub Admin
          </h1>
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
            error={localError || error || undefined}
            required
          />
          <Button type="submit" className="w-full" loading={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-secondary">
            Seed accounts (local dev)
          </p>
          <div className="flex flex-wrap gap-2">
            {STAFF_SEED_ACCOUNTS.map((acc) => (
              <button
                key={acc.phone}
                type="button"
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:border-brand/40 hover:bg-brand-soft hover:text-brand"
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
