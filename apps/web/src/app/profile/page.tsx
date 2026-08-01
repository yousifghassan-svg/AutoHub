'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { Button } from '@/components/ui';

export default function ProfilePage() {
  const router = useRouter();
  const { status, session, logout, authMode, completeProfile } = useAuth();
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'needs_profile') router.replace('/profile-setup');
  }, [status, router]);

  if (!session || status !== 'authenticated') {
    return <div className="page-container py-20 text-ink-secondary">Loading profile…</div>;
  }

  return (
    <div className="page-container max-w-xl py-10">
      <h1 className="section-title">Profile</h1>
      <p className="mt-2 text-sm text-ink-secondary">
        Update how you appear to buyers. Phone is tied to your login and cannot be changed here.
        {typeof session.user.profileCompletionPercent === 'number'
          ? ` Profile ${session.user.profileCompletionPercent}% complete.`
          : ''}
      </p>

      <div className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-card">
        <dl className="mb-6 grid gap-3 border-b border-border pb-6 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              Role
            </dt>
            <dd className="mt-0.5 text-ink">{session.user.role}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              Auth mode
            </dt>
            <dd className="mt-0.5 text-ink">{authMode}</dd>
          </div>
        </dl>

        {savedMessage ? (
          <p className="mb-4 text-sm text-success" role="status">
            {savedMessage}
          </p>
        ) : null}

        <ProfileForm
          mode="edit"
          user={session.user}
          submitLabel="Save changes"
          onSubmit={async (input) => {
            setSavedMessage(null);
            await completeProfile(input);
            setSavedMessage('Profile saved.');
          }}
          footer={
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/my-listings">
                <Button type="button" variant="secondary">
                  My listings
                </Button>
              </Link>
              <Link href="/favorites">
                <Button type="button" variant="secondary">
                  Favorites
                </Button>
              </Link>
              <Button type="button" variant="danger" onClick={() => void logout()}>
                Log out
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}
