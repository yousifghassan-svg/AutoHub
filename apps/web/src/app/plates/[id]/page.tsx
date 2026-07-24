'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ListingCard } from '@/components/ListingCard';
import { Badge, Button, Card, EmptyState, Skeleton } from '@/components/ui';
import { useFavorites } from '@/features/favorites/favorites-store';
import { formatPrice } from '@/features/listings/domain/mappers';
import { useListingDetail, useListingsPage } from '@/features/listings/hooks/useListings';
import { LicensePlate, licensePlateFromListing } from '@/features/plates';

export default function PlateDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const query = useListingDetail(id);
  const { isFavorite, toggle } = useFavorites();
  const listing = query.data;

  const related = useListingsPage(
    { categoryCode: 'PLATE', pageSize: 8, sortBy: 'createdAt' },
    Boolean(listing),
  );

  if (query.isLoading) {
    return (
      <div className="page-container space-y-8 py-10">
        <Skeleton className="aspect-[700/220] w-full max-w-3xl" />
        <Skeleton className="h-40 w-full max-w-lg" />
      </div>
    );
  }

  if (query.isError || !listing) {
    return (
      <EmptyState
        title="Plate listing not found"
        description={query.error instanceof Error ? query.error.message : undefined}
        action={
          <Link href="/plates">
            <Button variant="secondary">Back to plates</Button>
          </Link>
        }
      />
    );
  }

  const plate = licensePlateFromListing(listing.plateDetails);
  const relatedItems = (related.data?.items ?? []).filter((i) => i.id !== listing.id).slice(0, 4);

  return (
    <div className="page-container space-y-12 py-10">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {plate ? (
            <div className="rounded-2xl bg-surface-muted px-3 py-10 dark:bg-charcoal/40 sm:px-8">
              <LicensePlate
                {...plate}
                framed={false}
                size="fill"
                showExport
                className="mx-auto w-[92%] max-w-3xl"
              />
              <p className="mt-4 text-center text-sm text-ink-secondary">
                {plate.code} · {plate.letter} · {plate.number}
                {plate.governorate ? ` · ${plate.governorate}` : ''}
              </p>
            </div>
          ) : (
            <Card>
              <p className="text-ink-secondary">Plate preview unavailable for this listing.</p>
            </Card>
          )}
          <p className="text-center text-xs text-ink-secondary">
            <Link href={`/listings/${listing.id}`} className="font-semibold text-brand hover:underline">
              View full listing page
            </Link>
          </p>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {listing.isFeatured ? <Badge tone="brand">Featured</Badge> : null}
            {listing.isVerified ? <Badge tone="success">Verified</Badge> : null}
            <Badge>Plate</Badge>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {listing.title}
          </h1>
          <p className="text-3xl font-bold tabular-nums text-brand">
            {formatPrice(listing.price, listing.currencyCode)}
          </p>
          <p className="text-ink-secondary">
            {[listing.location, plate?.governorate, plate?.type].filter(Boolean).join(' · ')}
          </p>

          <Card className="space-y-3">
            <p className="text-sm font-semibold text-ink">Contact & actions</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={isFavorite(listing.id) ? 'primary' : 'secondary'}
                onClick={() => toggle(listing.id)}
              >
                {isFavorite(listing.id) ? 'Saved' : 'Favorite'}
              </Button>
              <a href={`mailto:support@autohub.iq?subject=${encodeURIComponent(listing.title)}`}>
                <Button>Contact seller</Button>
              </a>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-ink">
              {listing.description || 'No description provided.'}
            </p>
          </Card>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">Similar plates</h2>
          <Link href="/plates" className="text-sm font-semibold text-brand">
            Browse all
          </Link>
        </div>
        {relatedItems.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedItems.map((item) => (
              <ListingCard key={item.id} listing={item} href={`/plates/${item.id}`} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-secondary">No similar plates listed yet.</p>
        )}
      </section>
    </div>
  );
}
