'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button, Input } from '@/components/ui';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { status, completeProfile } = useAuth();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'authenticated') router.replace('/profile');
  }, [status, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Display name must be at least 2 characters');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await completeProfile(name.trim());
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
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
          <h1 className="font-display text-2xl font-bold text-ink">Complete profile</h1>
          <p className="mt-1 text-sm text-ink-secondary">Choose how buyers see your name.</p>
        </div>
        <Input
          label="Display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Saving…' : 'Continue'}
        </Button>
      </form>
    </div>
  );
}
