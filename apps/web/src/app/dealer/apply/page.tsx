'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { dealerAccountsRepository } from '@/features/dealers/data/dealer-accounts.repository';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import { Button, Input, Select, TextArea } from '@/components/ui';

export default function DealerApplyPage() {
  const router = useRouter();
  const { status } = useAuth();
  const catalog = useCatalogFilters();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [cityId, setCityId] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'needs_profile') router.replace('/profile-setup');
  }, [status, router]);

  useEffect(() => {
    void dealerAccountsRepository
      .getMe()
      .then(() => router.replace('/dealer/dashboard'))
      .catch(() => undefined);
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await dealerAccountsRepository.apply({
        name: name.trim(),
        slug: slug.trim() || undefined,
        cityId: cityId || undefined,
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      router.replace('/dealer/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  if (status !== 'authenticated') {
    return <div className="page-container py-20 text-ink-secondary">Loading…</div>;
  }

  return (
    <div className="page-container max-w-xl py-10">
      <h1 className="section-title">Apply as a dealer</h1>
      <p className="mt-2 text-sm text-ink-secondary">
        Create your dealership organization. An admin will review your application before it appears
        as verified in the marketplace.
      </p>

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="mt-8 space-y-5 rounded-xl border border-border bg-surface p-6 shadow-card"
      >
        <Input
          label="Dealership name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Slug (optional)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="auto-generated from name"
          hint="Lowercase letters, numbers, hyphens"
        />
        <Select label="City" value={cityId} onChange={(e) => setCityId(e.target.value)}>
          <option value="">Select city</option>
          {(catalog.data?.cities ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameEn}
            </option>
          ))}
        </Select>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input
            label="WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>
        <TextArea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <Button type="submit" disabled={loading || name.trim().length < 2}>
          {loading ? 'Submitting…' : 'Submit application'}
        </Button>
      </form>
    </div>
  );
}
