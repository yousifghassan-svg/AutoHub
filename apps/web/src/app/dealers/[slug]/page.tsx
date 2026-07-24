'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ListingCard } from '@/components/ListingCard';
import { Button, Card, EmptyState, Skeleton } from '@/components/ui';
import type { DealerOpeningHours } from '@/features/dealers/domain/types';
import { useDealerProfile } from '@/features/dealers/hooks/useDealers';
import { mediaPublicUrl } from '@/lib/media/url';

function formatOpeningHours(hours: DealerOpeningHours | null | undefined): string[] {
  if (!hours || typeof hours !== 'object') return [];
  return Object.entries(hours).map(([day, value]) => {
    if (typeof value === 'string') return `${day}: ${value}`;
    if (value?.closed) return `${day}: Closed`;
    if (value?.open && value?.close) return `${day}: ${value.open} – ${value.close}`;
    return `${day}: —`;
  });
}

export default function DealerProfilePage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const query = useDealerProfile(slug);

  if (query.isLoading) {
    return (
      <div className="page-container space-y-6 py-10">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <EmptyState
        title="Dealer not found"
        description={query.error instanceof Error ? query.error.message : undefined}
        action={
          <Link href="/dealers">
            <Button variant="secondary">Back to dealers</Button>
          </Link>
        }
      />
    );
  }

  const dealer = query.data;
  const stats = dealer.statistics;
  const coverSrc = mediaPublicUrl(dealer.coverImageUrl) ?? dealer.coverImageUrl;
  const logoSrc = mediaPublicUrl(dealer.logoUrl) ?? dealer.logoUrl;
  const hoursLines = formatOpeningHours(dealer.openingHours);
  const locationLine = [
    dealer.address,
    dealer.city?.nameEn ?? dealer.city?.nameAr,
    dealer.city?.governorate?.nameEn,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="pb-10">
      <div className="relative h-44 sm:h-56 lg:h-64">
        {coverSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 bg-charcoal-900"
            style={{
              backgroundImage:
                'linear-gradient(135deg, #0c0c0f 0%, #2a1014 50%, #17171c 100%)',
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="page-container relative -mt-16 space-y-10 sm:-mt-20">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-start gap-5">
            <div className="relative -mt-14 shrink-0 sm:-mt-16">
              {logoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoSrc}
                  alt=""
                  className="h-24 w-24 rounded-2xl border-4 border-surface bg-surface object-cover shadow-card sm:h-28 sm:w-28"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-surface bg-brand text-2xl font-bold text-white shadow-card sm:h-28 sm:w-28">
                  {dealer.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-bold text-ink">{dealer.name}</h1>
                {dealer.verified ? (
                  <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">
                    Verified dealer
                  </span>
                ) : null}
              </div>
              {locationLine ? (
                <p className="text-sm text-ink-secondary">{locationLine}</p>
              ) : null}
              <p className="mt-4 max-w-2xl text-ink">
                {dealer.bio || 'Professional automotive dealer on AutoHub.'}
              </p>
            </div>

            <div className="w-full space-y-2 sm:w-auto sm:min-w-[200px]">
              {dealer.phone ? (
                <a href={`tel:${dealer.phone}`}>
                  <Button className="w-full">Call {dealer.phone}</Button>
                </a>
              ) : null}
              {dealer.whatsapp ? (
                <a
                  href={`https://wa.me/${dealer.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" className="w-full">
                    WhatsApp
                  </Button>
                </a>
              ) : null}
              {!dealer.phone && !dealer.whatsapp ? (
                <Button disabled className="w-full">
                  Contact unavailable
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Active listings', value: stats.activeListings },
              { label: 'Sold', value: stats.sold },
              { label: 'Views', value: stats.views },
              { label: 'Followers', value: stats.followers },
            ].map((s) => (
              <Card key={s.label}>
                <p className="text-2xl font-bold tabular-nums text-ink">
                  {Number(s.value ?? 0).toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-ink-secondary">{s.label}</p>
              </Card>
            ))}
          </div>

          {hoursLines.length > 0 ? (
            <Card>
              <h2 className="text-sm font-semibold text-ink">Opening hours</h2>
              <ul className="mt-3 space-y-1 text-sm text-ink-secondary">
                {hoursLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </Card>
          ) : null}
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl font-semibold text-ink">Inventory</h2>
          {dealer.inventory.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dealer.inventory.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          ) : (
            <EmptyState title="No active inventory" description="This dealer has no live listings." />
          )}
        </section>

        <section>
          <Card>
            <h2 className="font-display text-xl font-semibold text-ink">Reviews</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              {dealer.reviews?.message ??
                'Buyer reviews are coming soon. For now, use listing quality, verification badges, and dealer response as trust signals.'}
            </p>
            {dealer.reviews?.placeholder !== false ? (
              <p className="mt-3 text-xs text-ink-secondary">
                Average rating and buyer feedback will appear here once reviews launch.
              </p>
            ) : null}
          </Card>
        </section>
      </div>
    </div>
  );
}
