'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { safeNextPath } from '@/features/auth/domain/safe-next-path';
import { Button, Input } from '@/components/ui';
import { config } from '@/lib/config';

function nextPath(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return safeNextPath(new URLSearchParams(window.location.search).get('next'));
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { sendOtp, authMode } = useAuth();
  const [phone, setPhone] = useState('+9647');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = phone.trim().replace(/\s/g, '');
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
      setError('Enter a valid phone number with country code (e.g. +9647XXXXXXXXX)');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendOtp(normalized);
      const next = nextPath();
      const qs = new URLSearchParams({ phone: normalized });
      if (next) qs.set('next', next);
      router.push(`/otp?${qs.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container flex min-h-[70vh] items-center justify-center py-12">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-5 rounded-xl border border-border bg-surface p-8 shadow-card"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Log in</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Enter your mobile number to receive a verification code.
            {authMode === 'dev' ? ` Dev code: ${config.authDevOtp}.` : ''}
          </p>
        </div>
        <Input
          label="Phone (E.164)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+9647700000000"
          required
        />
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Sending…' : 'Continue'}
        </Button>
        <p className="text-center text-sm text-ink-secondary">
          New here?{' '}
          <Link href="/register" className="font-semibold text-brand">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
