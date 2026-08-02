'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { loadVerification } from '@/features/auth/data/verification-storage';
import { Button, Input } from '@/components/ui';
import { config } from '@/lib/config';

const RESEND_SECONDS = 60;

function readQuery(name: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

export default function OtpPage() {
  const router = useRouter();
  const { verifyOtp, verification, authMode, sendOtp, status } = useAuth();
  const [phoneHint, setPhoneHint] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ensuring, setEnsuring] = useState(true);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const [hint, setHint] = useState('');

  useEffect(() => {
    // Client-only defaults avoid SSR/client mismatch.
    if (authMode === 'dev') {
      setCode(config.authDevOtp);
      setHint(`Use ${config.authDevOtp} in dev auth mode.`);
    }
  }, [authMode]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setInterval(() => {
      setResendIn((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendIn]);

  useEffect(() => {
    let cancelled = false;
    const phone = readQuery('phone');
    const stored = loadVerification();
    setPhoneHint(verification?.phoneE164 ?? stored?.phoneE164 ?? phone ?? '');

    void (async () => {
      try {
        if (!verification && !stored && phone && authMode === 'dev') {
          await sendOtp(phone);
          if (!cancelled) {
            setPhoneHint(phone);
            setResendIn(RESEND_SECONDS);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not start verification');
        }
      } finally {
        if (!cancelled) setEnsuring(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const next = readQuery('next');
    if (next === 'profile-setup') {
      router.replace('/profile-setup');
      return;
    }
    router.replace(next && next.startsWith('/') ? next : '/');
  }, [status, router]);

  const onResend = async () => {
    const phone = readQuery('phone') ?? verification?.phoneE164 ?? loadVerification()?.phoneE164;
    if (!phone || resendIn > 0) return;
    setResending(true);
    setError(null);
    try {
      await sendOtp(phone);
      setPhoneHint(phone);
      setResendIn(RESEND_SECONDS);
      if (authMode === 'dev') setCode(config.authDevOtp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!/^\d{4,8}$/.test(trimmed)) {
      setError('Enter a valid verification code');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (!verification && !loadVerification()) {
        const phone = readQuery('phone');
        if (phone) await sendOtp(phone);
      }
      const session = await verifyOtp(trimmed);
      const next = readQuery('next');
      if (!session.profileSetupComplete || next === 'profile-setup') {
        router.replace('/profile-setup');
      } else {
        router.replace(next && next.startsWith('/') ? next : '/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container flex min-h-[70vh] items-center justify-center py-12">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-5 rounded-xl border border-border bg-surface p-8 shadow-card"
        suppressHydrationWarning
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Enter OTP</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Code sent to {phoneHint || 'your phone'}.
            {hint ? ` ${hint}` : ''}
          </p>
          {ensuring ? (
            <p className="mt-2 text-xs text-ink-secondary">Preparing verification…</p>
          ) : null}
          <p className="mt-2 text-sm font-medium text-ink" aria-live="polite">
            {resendIn > 0
              ? `Resend available in ${resendIn}s`
              : 'You can resend a new code now.'}
          </p>
        </div>
        <Input
          label="Verification code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
          inputMode="numeric"
          autoComplete="one-time-code"
          required
        />
        {error ? (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={loading || !code.trim()} className="w-full">
          {loading ? 'Verifying…' : 'Verify & continue'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={resending || resendIn > 0 || ensuring}
          onClick={() => void onResend()}
        >
          {resending ? 'Sending…' : resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend OTP'}
        </Button>
        <p className="text-center text-sm text-ink-secondary">
          Wrong number?{' '}
          <Link href="/login" className="font-semibold text-brand">
            Start over
          </Link>
        </p>
      </form>
    </div>
  );
}
