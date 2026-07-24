'use client';

import Link from 'next/link';
import { Card, EmptyState, SectionHeader, Skeleton } from '@/components/ui';
import { dealerActiveCount } from '@/features/dealers/data/dealers.repository';
import { useDealers } from '@/features/dealers/hooks/useDealers';

export default function DealersPage() {
  const dealers = useDealers({ pageSize: 24, verifiedOnly: false });

  return (
    <div className="page-container py-10">
      <SectionHeader
        title="Dealers"
        subtitle="Browse premium showrooms and verified inventory across Iraq."
      />
      {dealers.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : dealers.isError ? (
        <EmptyState
          title="Could not load dealers"
          description={dealers.error instanceof Error ? dealers.error.message : undefined}
        />
      ) : !(dealers.data?.items.length) ? (
        <EmptyState title="No dealers yet" description="Check back soon for premium partners." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dealers.data.items.map((d) => (
            <Link key={d.id} href={`/dealers/${d.slug}`}>
              <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink">{d.name}</h2>
                    <p className="mt-1 text-sm text-ink-secondary">
                      {d.city?.nameEn ?? d.city?.nameAr ?? 'Iraq'}
                    </p>
                  </div>
                  {d.verified ? (
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
      )}
    </div>
  );
}
