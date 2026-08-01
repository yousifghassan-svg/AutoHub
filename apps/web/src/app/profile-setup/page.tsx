'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import { Button, Input, Select } from '@/components/ui';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { status, session, completeProfile } = useAuth();
  const catalog = useCatalogFilters();
  const [displayName, setDisplayName] = useState(session?.user.displayName ?? '');
  const [governorateId, setGovernorateId] = useState(
    session?.user.governorate?.id ?? '',
  );
  const [cityId, setCityId] = useState(session?.user.cityId ?? '');
  const [preferredLanguage, setPreferredLanguage] = useState<'ar' | 'ku' | 'en' | ''>(
    session?.user.preferredLanguage ?? '',
  );
  const [email, setEmail] = useState(session?.user.email ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(session?.user.dateOfBirth ?? '');
  const [avatarUrl, setAvatarUrl] = useState(session?.user.avatarUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'authenticated') router.replace('/profile');
  }, [status, router]);

  const cities = useMemo(
    () =>
      (catalog.data?.cities ?? []).filter(
        (c) => !governorateId || c.governorateId === governorateId,
      ),
    [catalog.data?.cities, governorateId],
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim().length < 2) {
      setError('Display name must be at least 2 characters');
      return;
    }
    if (!cityId) {
      setError('Please select your city');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await completeProfile({
        displayName: displayName.trim(),
        cityId,
        preferredLanguage: preferredLanguage || undefined,
        email: email.trim() ? email.trim() : undefined,
        dateOfBirth: dateOfBirth || undefined,
        avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : undefined,
      });
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
          <p className="mt-1 text-sm text-ink-secondary">
            Tell buyers who you are and where you are based.
          </p>
        </div>

        <Input
          label="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />

        <Select
          label="Governorate"
          value={governorateId}
          onChange={(e) => {
            setGovernorateId(e.target.value);
            setCityId('');
          }}
          required
        >
          <option value="">Select governorate</option>
          {(catalog.data?.governorates ?? []).map((g) => (
            <option key={g.id} value={g.id}>
              {g.nameEn}
            </option>
          ))}
        </Select>

        <Select
          label="City"
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          required
          disabled={!governorateId}
        >
          <option value="">Select city</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameEn}
            </option>
          ))}
        </Select>

        <Select
          label="Preferred language (optional)"
          value={preferredLanguage}
          onChange={(e) =>
            setPreferredLanguage(e.target.value as 'ar' | 'ku' | 'en' | '')
          }
        >
          <option value="">Default</option>
          <option value="ar">Arabic</option>
          <option value="ku">Kurdish</option>
          <option value="en">English</option>
        </Select>

        <Input
          label="Email (optional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Date of birth (optional)"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />

        <Input
          label="Profile picture URL (optional)"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://"
        />

        {error ? <p className="text-sm text-error">{error}</p> : null}
        <Button type="submit" disabled={loading || catalog.isLoading} className="w-full">
          {loading ? 'Saving…' : 'Continue'}
        </Button>
      </form>
    </div>
  );
}
