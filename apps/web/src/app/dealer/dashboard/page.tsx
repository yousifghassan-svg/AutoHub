'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  dealerAccountsRepository,
  type DealerMeResponse,
  type DealerMemberRow,
  type DealerStats,
} from '@/features/dealers/data/dealer-accounts.repository';
import { uploadMediaFile } from '@/features/media/data/media.repository';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import { Button, Input, Select, TextArea } from '@/components/ui';

export default function DealerDashboardPage() {
  const router = useRouter();
  const { status } = useAuth();
  const catalog = useCatalogFilters();
  const [me, setMe] = useState<DealerMeResponse | null>(null);
  const [stats, setStats] = useState<DealerStats | null>(null);
  const [members, setMembers] = useState<DealerMemberRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invitePhone, setInvitePhone] = useState('');

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cityId, setCityId] = useState('');
  const [openingHours, setOpeningHours] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await dealerAccountsRepository.getMe();
      setMe(next);
      setName(next.organization.name);
      setBio(next.organization.bio ?? '');
      setPhone(next.organization.phone ?? '');
      setWhatsapp(next.organization.whatsapp ?? '');
      setCityId(next.organization.cityId ?? '');
      setOpeningHours(next.organization.openingHours ?? '');
      const [s, m] = await Promise.all([
        dealerAccountsRepository.getStats(),
        dealerAccountsRepository.listMembers(),
      ]);
      setStats(s);
      setMembers(m.items);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'needs_profile') router.replace('/profile-setup');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') void load();
  }, [status, load]);

  const canEdit =
    me?.membershipRole === 'OWNER' || me?.membershipRole === 'MANAGER';

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const next = await dealerAccountsRepository.updateMe({
        name: name.trim(),
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        whatsapp: whatsapp.trim() || null,
        cityId: cityId || null,
        openingHours: openingHours.trim() || null,
      });
      setMe(next);
      setMessage('Dealership saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const uploadBrandImage = async (kind: 'logo' | 'cover', file: File) => {
    if (!me || !canEdit) return;
    setError(null);
    try {
      const asset = await uploadMediaFile(file, {
        mediaType: 'IMAGE',
        visibility: 'PUBLIC',
        ownerModule: 'dealer',
        ownerEntityId: me.organization.id,
      });
      const url =
        asset.urls?.original ??
        asset.urls?.large ??
        asset.urls?.medium ??
        asset.urls?.thumbnail ??
        null;
      const next = await dealerAccountsRepository.updateMe(
        kind === 'logo'
          ? { logoMediaId: asset.id, ...(url ? { logoUrl: url } : {}) }
          : { coverMediaId: asset.id, ...(url ? { coverImageUrl: url } : {}) },
      );
      setMe(next);
      setMessage(kind === 'logo' ? 'Logo updated.' : 'Cover updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  if (status !== 'authenticated' || loading) {
    return <div className="page-container py-20 text-ink-secondary">Loading dealer account…</div>;
  }

  if (!me) {
    return (
      <div className="page-container max-w-lg py-16">
        <h1 className="section-title">Dealer account</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          You do not have a dealer organization yet. Apply to create one for admin review.
        </p>
        <Link href="/dealer/apply" className="mt-6 inline-block">
          <Button>Apply as dealer</Button>
        </Link>
      </div>
    );
  }

  const org = me.organization;

  return (
    <div className="page-container max-w-3xl space-y-8 py-10">
      <div>
        <h1 className="section-title">Dealer dashboard</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          {org.name} · /dealers/{org.slug} · role {me.membershipRole}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <p className="text-sm font-medium text-ink">
          Verification: <span className="text-brand">{org.verificationStatus}</span>
        </p>
        {org.verificationStatus === 'PENDING' ? (
          <p className="mt-1 text-sm text-ink-secondary">
            Your application is under review. You can still edit your profile.
          </p>
        ) : null}
        {org.verificationStatus === 'REJECTED' ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-error">
              Rejected{org.rejectionReason ? `: ${org.rejectionReason}` : ''}
            </p>
            {me.membershipRole === 'OWNER' ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  void dealerAccountsRepository
                    .reapply()
                    .then((next) => {
                      setMe(next);
                      setMessage('Reapplied — status is PENDING again.');
                    })
                    .catch((err) =>
                      setError(err instanceof Error ? err.message : 'Reapply failed'),
                    );
                }}
              >
                Reapply
              </Button>
            ) : null}
          </div>
        ) : null}
        {org.verified ? (
          <Link
            href={`/dealers/${org.slug}`}
            className="mt-2 inline-block text-sm font-medium text-brand hover:underline"
          >
            View public page
          </Link>
        ) : null}
      </div>

      {stats ? (
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ['Active listings', stats.activeListings],
            ['Sold', stats.sold],
            ['Followers', stats.followers],
            ['Views', stats.views],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-border bg-surface px-4 py-3 shadow-card"
            >
              <p className="text-xs uppercase tracking-wide text-ink-secondary">{label}</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={(e) => void save(e)}
        className="space-y-4 rounded-xl border border-border bg-surface p-6 shadow-card"
      >
        <h2 className="font-display text-lg font-semibold text-ink">Organization profile</h2>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={!canEdit}
        />
        <Select
          label="City"
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          disabled={!canEdit}
        >
          <option value="">Select city</option>
          {(catalog.data?.cities ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameEn}
            </option>
          ))}
        </Select>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!canEdit}
          />
          <Input
            label="WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <Input
          label="Opening hours"
          value={openingHours}
          onChange={(e) => setOpeningHours(e.target.value)}
          disabled={!canEdit}
        />
        <TextArea
          label="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={!canEdit}
        />

        {canEdit ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1.5 block font-medium text-ink-secondary">Logo</span>
              {org.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={org.logoUrl}
                  alt=""
                  className="mb-2 h-16 w-16 rounded-lg border border-border object-cover"
                />
              ) : null}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) void uploadBrandImage('logo', file);
                }}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block font-medium text-ink-secondary">Cover</span>
              {org.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={org.coverImageUrl}
                  alt=""
                  className="mb-2 h-16 w-full rounded-lg border border-border object-cover"
                />
              ) : null}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) void uploadBrandImage('cover', file);
                }}
              />
            </label>
          </div>
        ) : null}

        {canEdit ? (
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        ) : (
          <p className="text-sm text-ink-secondary">STAFF can view but not edit the organization.</p>
        )}
      </form>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold text-ink">Members</h2>
        <ul className="divide-y divide-border">
          {members.map((m) => (
            <li key={m.userId} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="text-sm font-medium text-ink">
                  {m.displayName ?? m.phone ?? m.userId}
                </p>
                <p className="text-xs text-ink-secondary">
                  {m.role} · {m.phone ?? 'no phone'}
                </p>
              </div>
              {canEdit && m.role !== 'OWNER' ? (
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    void dealerAccountsRepository
                      .removeMember(m.userId)
                      .then(() => load())
                      .catch((err) =>
                        setError(err instanceof Error ? err.message : 'Remove failed'),
                      );
                  }}
                >
                  Remove
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
        {canEdit ? (
          <div className="flex flex-wrap items-end gap-2">
            <Input
              label="Invite by phone"
              value={invitePhone}
              onChange={(e) => setInvitePhone(e.target.value)}
              placeholder="+9647…"
              className="min-w-[200px] flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void dealerAccountsRepository
                  .addMember({ phone: invitePhone.trim(), role: 'STAFF' })
                  .then(() => {
                    setInvitePhone('');
                    return load();
                  })
                  .catch((err) =>
                    setError(err instanceof Error ? err.message : 'Invite failed'),
                  );
              }}
            >
              Add STAFF
            </Button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/my-listings">
          <Button type="button" variant="secondary">
            My listings
          </Button>
        </Link>
        <Link href="/profile">
          <Button type="button" variant="ghost">
            Profile
          </Button>
        </Link>
      </div>

      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}
