'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Button, Input, Select, TextArea } from '@/components/ui';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import type { AuthenticatedUser, UpdateProfileInput } from '@/lib/api/types';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  emptyProfileFormValues,
  profileFormValuesToUpdateInput,
  validateProfileForm,
  type ProfileFormValues,
} from '../domain/profile-form';
import { AvatarUploadField } from './AvatarUploadField';

export type ProfileFormProps = {
  mode: 'setup' | 'edit';
  user: AuthenticatedUser | null | undefined;
  submitLabel: string;
  onSubmit: (input: UpdateProfileInput) => Promise<void>;
  footer?: ReactNode;
};

function valuesFromUser(user: AuthenticatedUser | null | undefined): ProfileFormValues {
  if (!user) return emptyProfileFormValues();
  return {
    displayName: user.displayName ?? '',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    governorateId: user.governorate?.id ?? user.city?.governorateId ?? '',
    cityId: user.cityId ?? '',
    preferredLanguage: user.preferredLanguage ?? '',
    email: user.email ?? '',
    dateOfBirth: user.dateOfBirth ?? '',
    avatarUrl: user.avatarUrl ?? '',
    avatarMediaId: user.avatarMediaId ?? '',
    bio: user.sellerProfile?.bio ?? '',
    notificationPreferences: {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...(user.notificationPreferences ?? {}),
    },
  };
}

const NOTIFICATION_TOGGLES: Array<{
  key: keyof ProfileFormValues['notificationPreferences'];
  label: string;
}> = [
  { key: 'pushEnabled', label: 'Push notifications' },
  { key: 'emailEnabled', label: 'Email notifications' },
  { key: 'smsEnabled', label: 'SMS notifications' },
  { key: 'newMessage', label: 'New messages' },
  { key: 'listingApproved', label: 'Listing approved' },
  { key: 'listingRejected', label: 'Listing rejected' },
  { key: 'priceChange', label: 'Price changes' },
  { key: 'favouriteUpdate', label: 'Favourite updates' },
  { key: 'dealerReply', label: 'Dealer replies' },
  { key: 'system', label: 'System alerts' },
];

/**
 * Shared profile setup / edit form. Persists via PATCH /v1/auth/me
 * (includes seller + notification preference fields).
 */
export function ProfileForm({
  mode,
  user,
  submitLabel,
  onSubmit,
  footer,
}: ProfileFormProps) {
  const catalog = useCatalogFilters();
  const [values, setValues] = useState<ProfileFormValues>(() => valuesFromUser(user));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValues(valuesFromUser(user));
  }, [user]);

  const cities = useMemo(
    () =>
      (catalog.data?.cities ?? []).filter(
        (c) => !values.governorateId || c.governorateId === values.governorateId,
      ),
    [catalog.data?.cities, values.governorateId],
  );

  const governorateName = useMemo(() => {
    const g = (catalog.data?.governorates ?? []).find((x) => x.id === values.governorateId);
    return g?.nameEn ?? user?.governorate?.nameEn ?? null;
  }, [catalog.data?.governorates, values.governorateId, user?.governorate?.nameEn]);

  const cityName = useMemo(() => {
    const c = cities.find((x) => x.id === values.cityId);
    return c?.nameEn ?? user?.city?.nameEn ?? null;
  }, [cities, values.cityId, user?.city?.nameEn]);

  const patch = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const patchPref = (
    key: keyof ProfileFormValues['notificationPreferences'],
    value: boolean,
  ) => {
    setValues((prev) => ({
      ...prev,
      notificationPreferences: { ...prev.notificationPreferences, [key]: value },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = validateProfileForm(values);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(
        profileFormValuesToUpdateInput(result.values, {
          clearOptionalEmpty: mode === 'edit',
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const completion = user?.profileCompletionPercent;

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      {typeof completion === 'number' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink">Profile completion</span>
            <span className="text-ink-secondary">{completion}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${Math.min(100, Math.max(0, completion))}%` }}
            />
          </div>
        </div>
      ) : null}

      {user?.phone ? (
        <Input label="Phone" value={user.phone} readOnly disabled />
      ) : (
        <div className="rounded-lg border border-border bg-surface-muted/40 px-3 py-2 text-sm text-ink-secondary">
          Phone is linked to your login and cannot be changed here.
        </div>
      )}

      <Input
        label="Display name"
        value={values.displayName}
        onChange={(e) => patch('displayName', e.target.value)}
        required
        autoComplete="nickname"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="First name"
          value={values.firstName}
          onChange={(e) => patch('firstName', e.target.value)}
          autoComplete="given-name"
        />
        <Input
          label="Last name"
          value={values.lastName}
          onChange={(e) => patch('lastName', e.target.value)}
          autoComplete="family-name"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Country" value="IQ" disabled onChange={() => undefined}>
          <option value="IQ">Iraq</option>
        </Select>

        <Select
          label="Governorate"
          value={values.governorateId}
          onChange={(e) => {
            patch('governorateId', e.target.value);
            patch('cityId', '');
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
      </div>

      <Select
        label="City"
        value={values.cityId}
        onChange={(e) => patch('cityId', e.target.value)}
        required
        disabled={!values.governorateId}
      >
        <option value="">Select city</option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nameEn}
          </option>
        ))}
      </Select>

      {(governorateName || cityName) && (
        <p className="text-xs text-ink-secondary">
          Location: Iraq
          {governorateName ? ` · ${governorateName}` : ''}
          {cityName ? ` · ${cityName}` : ''}
        </p>
      )}

      <div className="rounded-lg border border-border bg-surface-muted/40 px-3 py-3 text-sm">
        <p className="font-medium text-ink">
          Seller type:{' '}
          {user?.sellerProfile?.type === 'DEALER' ? 'Dealer (verified org)' : 'Private seller'}
        </p>
        <p className="mt-1 text-ink-secondary">
          Dealer status comes from organization verification — not a free profile toggle.
        </p>
        <Link href="/dealer/dashboard" className="mt-2 inline-block font-medium text-brand hover:underline">
          Dealer account / apply
        </Link>
      </div>

      <TextArea
        label="Bio"
        value={values.bio}
        onChange={(e) => patch('bio', e.target.value)}
        placeholder="Tell buyers about yourself"
        maxLength={2000}
      />

      <Select
        label="Preferred language"
        value={values.preferredLanguage}
        onChange={(e) =>
          patch('preferredLanguage', e.target.value as ProfileFormValues['preferredLanguage'])
        }
      >
        <option value="">Default</option>
        <option value="ar">Arabic</option>
        <option value="ku">Kurdish</option>
        <option value="en">English</option>
      </Select>

      <Input
        label="Email"
        type="email"
        value={values.email}
        onChange={(e) => patch('email', e.target.value)}
        autoComplete="email"
        placeholder="optional"
      />

      <Input
        label="Date of birth"
        type="date"
        value={values.dateOfBirth}
        onChange={(e) => patch('dateOfBirth', e.target.value)}
      />

      <div className="space-y-3">
        <p className="text-sm font-medium text-ink-secondary">Profile picture</p>
        <AvatarUploadField
          userId={user?.id}
          avatarUrl={values.avatarUrl}
          onUploaded={({ mediaId, url }) => {
            patch('avatarMediaId', mediaId);
            patch('avatarUrl', url);
          }}
          onCleared={() => {
            patch('avatarMediaId', '');
            patch('avatarUrl', '');
          }}
        />
        <Input
          label="Or paste image URL"
          type="url"
          value={values.avatarUrl}
          onChange={(e) => {
            patch('avatarUrl', e.target.value);
            if (e.target.value !== values.avatarUrl) {
              patch('avatarMediaId', '');
            }
          }}
          placeholder="https://"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-ink-secondary">
          Notification preferences
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {NOTIFICATION_TOGGLES.map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-ink"
            >
              <input
                type="checkbox"
                checked={values.notificationPreferences[item.key]}
                onChange={(e) => patchPref(item.key, e.target.checked)}
                className="h-4 w-4"
              />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <Button type="submit" disabled={loading || catalog.isLoading} className="w-full sm:w-auto">
        {loading ? 'Saving…' : submitLabel}
      </Button>

      {footer}
    </form>
  );
}
