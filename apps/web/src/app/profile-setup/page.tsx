'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  hrefWithNext,
  resolveLoginReturn,
} from '@/features/auth/domain/login-return';
import { safeNextPath } from '@/features/auth/domain/safe-next-path';
import { ProfileForm } from '@/features/profile/components/ProfileForm';

function readNextFromWindow(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return safeNextPath(new URLSearchParams(window.location.search).get('next'));
  } catch {
    return null;
  }
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const { status, session, completeProfile } = useAuth();

  useEffect(() => {
    const next = readNextFromWindow();
    if (status === 'unauthenticated') {
      router.replace(hrefWithNext('/login', next));
      return;
    }
    if (status === 'authenticated') {
      router.replace(resolveLoginReturn(next, '/profile'));
    }
  }, [status, router]);

  if (status === 'bootstrapping' || status === 'unauthenticated' || status === 'authenticated') {
    return (
      <div className="page-container flex min-h-[70vh] items-center justify-center py-12 text-ink-secondary">
        Loading…
      </div>
    );
  }

  return (
    <div className="page-container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-lg space-y-5 rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Complete profile</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Tell buyers who you are and where you are based. Display name and city are required.
          </p>
        </div>

        <ProfileForm
          mode="setup"
          user={session?.user}
          submitLabel="Continue"
          onSubmit={async (input) => {
            await completeProfile(input);
            router.replace(resolveLoginReturn(readNextFromWindow(), '/'));
          }}
        />
      </div>
    </div>
  );
}
