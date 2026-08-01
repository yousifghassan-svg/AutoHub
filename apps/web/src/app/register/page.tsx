'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button, Input } from '@/components/ui';
import { config } from '@/lib/config';

/** Register uses the same phone OTP login — Nest findOrCreate on first login. */
export default function RegisterPage() {
  const router = useRouter();
  const { sendOtp, authMode } = useAuth();
  const [phone, setPhone] = useState('+9647');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendOtp(phone);
      router.push(`/otp?phone=${encodeURIComponent(phone)}&next=profile-setup`);
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
          <h1 className="font-display text-2xl font-bold text-ink">Create account</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Verify your Iraqi mobile number. Accounts are created on first successful OTP.
            {authMode === 'dev' ? ` Dev OTP: ${config.authDevOtp}.` : ''}
          </p>
        </div>
        <Input
          label="Phone (E.164)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Sending…' : 'Send verification code'}
        </Button>
        <p className="text-center text-sm text-ink-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
