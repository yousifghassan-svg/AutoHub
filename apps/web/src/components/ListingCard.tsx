'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatMileage, formatPrice } from '@/features/listings/domain/mappers';
import type { ListingCardModel } from '@/features/listings/domain/types';
import { useFavorites } from '@/features/favorites/favorites-store';
import { listingImageSrc } from '@/lib/media/url';
import { Badge, cn } from './ui';

export function ListingCard({
  listing,
  className,
}: {
  listing: ListingCardModel;
  className?: string;
}) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(listing.id);

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-lg border border-border bg-surface shadow-card transition hover:shadow-lift',
        className,
      )}
    >
      <div className="relative aspect-[4/3] bg-surface-muted">
        <Link href={`/listings/${listing.id}`}>
          <Image
            src={listingImageSrc(listing.imageUrl, listing.id)}
            alt={listing.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        </Link>
        <button
          type="button"
          aria-label={fav ? 'Remove favorite' : 'Add favorite'}
          onClick={() => toggle(listing.id)}
          className={cn(
            'absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur',
            fav ? 'bg-brand text-white' : 'bg-white/90 text-ink',
          )}
        >
          {fav ? '♥' : '♡'}
        </button>
        <div className="absolute left-3 top-3 flex gap-1.5">
          {listing.isFeatured ? <Badge tone="brand">Featured</Badge> : null}
          {listing.isVerified ? <Badge tone="success">Verified</Badge> : null}
        </div>
      </div>
      <Link href={`/listings/${listing.id}`} className="block space-y-1 p-4">
        <h3 className="line-clamp-2 font-display text-base font-semibold text-ink">
          {listing.title}
        </h3>
        <p className="text-lg font-bold text-brand">
          {formatPrice(listing.price, listing.currencyCode)}
        </p>
        <p className="text-sm text-ink-secondary">
          {[listing.location, listing.year, formatMileage(listing.mileageKm)]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </Link>
    </article>
  );
}
