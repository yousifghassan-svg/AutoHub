'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button } from '@/components/ui';

export default function ProfilePage() {
  const router = useRouter();
  const { status, session, logout, authMode } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'needs_profile') router.replace('/profile-setup');
  }, [status, router]);

  if (!session) {
    return <div className="page-container py-20 text-ink-secondary">Loading profile…</div>;
  }

  return (
    <div className="page-container max-w-xl py-10">
      <h1 className="section-title">Profile</h1>
      <div className="mt-6 space-y-4 rounded-xl border border-border bg-surface p-6 shadow-card">
        <Row label="Name" value={session.user.displayName ?? '—'} />
        <Row label="Phone" value={session.user.phone ?? '—'} />
        <Row label="Role" value={session.user.role} />
        <Row label="Auth mode" value={authMode} />
        <Row label="User ID" value={session.user.id} />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/my-listings">
          <Button variant="secondary">My listings</Button>
        </Link>
        <Link href="/favorites">
          <Button variant="secondary">Favorites</Button>
        </Link>
        <Button variant="danger" onClick={() => void logout()}>
          Log out
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
        {label}
      </span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
