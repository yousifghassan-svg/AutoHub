'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button, Input } from '@/components/ui';
import { config } from '@/lib/config';

function OtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');
  const { verifyOtp, verification, authMode } = useAuth();
  const [code, setCode] = useState(authMode === 'mock' ? config.mockOtpCode : '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const session = await verifyOtp(code);
      if (!session.profileSetupComplete || next === 'profile-setup') {
        router.replace('/profile-setup');
      } else {
        router.replace('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
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
          <h1 className="font-display text-2xl font-bold text-ink">Enter OTP</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Code sent to {verification?.phoneE164 ?? 'your phone'}.
          </p>
        </div>
        <Input
          label="Verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric"
          required
        />
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <Button type="submit" disabled={loading || !verification} className="w-full">
          {loading ? 'Verifying…' : 'Verify & continue'}
        </Button>
      </form>
    </div>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={<div className="page-container py-20">Loading…</div>}>
      <OtpForm />
    </Suspense>
  );
}
