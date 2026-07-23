'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge, Button, EmptyState, Skeleton } from '@/components/ui';
import { useFavorites } from '@/features/favorites/favorites-store';
import { formatMileage, formatPrice } from '@/features/listings/domain/mappers';
import { useListingDetail } from '@/features/listings/hooks/useListings';
import { listingImageSrc } from '@/lib/media/url';

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const query = useListingDetail(id);
  const { isFavorite, toggle } = useFavorites();
  const listing = query.data;

  if (query.isLoading) {
    return (
      <div className="page-container grid gap-8 py-10 lg:grid-cols-2">
        <Skeleton className="aspect-[4/3] w-full" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (query.isError || !listing) {
    return (
      <EmptyState
        title="Listing not found"
        description={query.error instanceof Error ? query.error.message : undefined}
        action={
          <Link href="/search">
            <Button variant="secondary">Back to search</Button>
          </Link>
        }
      />
    );
  }

  const hero =
    listing.media[0]?.url ?? listingImageSrc(listing.imageUrl, listing.id);

  return (
    <div className="page-container grid gap-10 py-10 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-muted">
          <Image src={hero} alt={listing.title} fill className="object-cover" unoptimized />
        </div>
        {listing.media.length > 1 ? (
          <div className="grid grid-cols-4 gap-2">
            {listing.media.slice(0, 4).map((m) => (
              <div key={m.id} className="relative aspect-square overflow-hidden rounded-md">
                <Image
                  src={listingImageSrc(m.url, m.id)}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {listing.isFeatured ? <Badge tone="brand">Featured</Badge> : null}
          {listing.isVerified ? <Badge tone="success">Verified</Badge> : null}
          <Badge>{listing.categoryCode}</Badge>
        </div>
        <h1 className="font-display text-3xl font-bold text-ink">{listing.title}</h1>
        <p className="text-3xl font-bold text-brand">
          {formatPrice(listing.price, listing.currencyCode)}
        </p>
        <p className="text-ink-secondary">
          {[listing.location, listing.year, formatMileage(listing.mileageKm)]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <p className="whitespace-pre-wrap text-ink">{listing.description || 'No description.'}</p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={isFavorite(listing.id) ? 'primary' : 'secondary'}
            onClick={() => toggle(listing.id)}
          >
            {isFavorite(listing.id) ? 'Saved' : 'Save to favorites'}
          </Button>
          <Link href="/search">
            <Button variant="ghost">More listings</Button>
          </Link>
        </div>
        <p className="text-xs text-ink-secondary">
          Views {listing.viewsCount ?? '—'} · Favorites {listing.favoritesCount ?? '—'}
        </p>
      </div>
    </div>
  );
}
