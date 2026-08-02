'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  EmptyState,
  Input,
  SectionHeader,
  Select,
  Skeleton,
} from '@/components/ui';
import { dealerActiveCount } from '@/features/dealers/data/dealers.repository';
import { useDealers } from '@/features/dealers/hooks/useDealers';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';

export default function DealersPage() {
  const catalog = useCatalogFilters();
  const [q, setQ] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [governorateId, setGovernorateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);

  const cities = useMemo(
    () =>
      (catalog.data?.cities ?? []).filter(
        (c) => !governorateId || c.governorateId === governorateId,
      ),
    [catalog.data?.cities, governorateId],
  );

  const dealers = useDealers({
    page,
    pageSize: 24,
    q: submitted || undefined,
    verifiedOnly: verifiedOnly || undefined,
    cityId: cityId || undefined,
    governorateId: governorateId || undefined,
  });

  return (
    <div className="page-container py-10">
      <SectionHeader
        title="Dealers"
        subtitle="Browse premium showrooms and verified inventory across Iraq."
      />

      <form
        className="mb-6 grid gap-3 rounded-xl border border-border bg-surface p-4 shadow-card md:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSubmitted(q.trim());
        }}
      >
        <Input
          label="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Dealer name…"
        />
        <Select
          label="Governorate"
          value={governorateId}
          onChange={(e) => {
            setGovernorateId(e.target.value);
            setCityId('');
            setPage(1);
          }}
        >
          <option value="">All Iraq</option>
          {(catalog.data?.governorates ?? []).map((g) => (
            <option key={g.id} value={g.id}>
              {g.nameEn}
            </option>
          ))}
        </Select>
        <Select
          label="City"
          value={cityId}
          onChange={(e) => {
            setCityId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Any city</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameEn}
            </option>
          ))}
        </Select>
        <div className="flex flex-col justify-end gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => {
                setVerifiedOnly(e.target.checked);
                setPage(1);
              }}
            />
            Verified only
          </label>
          <Button type="submit">Search</Button>
        </div>
      </form>

      {dealers.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : dealers.isError ? (
        <EmptyState
          title="Could not load dealers"
          description={
            dealers.error instanceof Error ? dealers.error.message : undefined
          }
        />
      ) : !(dealers.data?.items.length) ? (
        <EmptyState
          title="No dealers found"
          description="Try a different city or clear filters."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dealers.data.items.map((d) => (
              <Link key={d.id} href={`/dealers/${d.slug}`}>
                <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-lift">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl font-semibold text-ink">
                        {d.name}
                      </h2>
                      <p className="mt-1 text-sm text-ink-secondary">
                        {d.city?.nameEn ?? d.city?.nameAr ?? 'Iraq'}
                      </p>
                    </div>
                    {d.verificationStatus === 'VERIFIED' || d.verified ? (
                      <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                        Verified
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm text-ink-secondary">
                    {d.bio || 'Professional automotive dealer on AutoHub.'}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-brand">
                    {dealerActiveCount(d)} active listings
                  </p>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-ink-secondary">
              Page {dealers.data.page} of {dealers.data.totalPages || 1}
            </span>
            <Button
              type="button"
              variant="secondary"
              disabled={page >= (dealers.data.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
