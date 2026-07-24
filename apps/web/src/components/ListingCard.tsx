'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { formatMileage, formatPrice } from '@/features/listings/domain/mappers';
import type { ListingCardModel } from '@/features/listings/domain/types';
import { useFavorites } from '@/features/favorites/favorites-store';
import { LicensePlate, licensePlateFromListing } from '@/features/plates';
import { listingImageSrc } from '@/lib/media/url';
import { Badge, cn } from './ui';

export function ListingCard({
  listing,
  className,
  href,
}: {
  listing: ListingCardModel;
  className?: string;
  /** Override detail link (e.g. `/plates/[id]`). */
  href?: string;
}) {
  const detailHref = href ?? `/listings/${listing.id}`;
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(listing.id);
  const plate = licensePlateFromListing(listing.plateDetails);
  const showPlate = listing.categoryCode === 'PLATE' && plate;
  const images =
    listing.imageUrls.length > 0
      ? listing.imageUrls
      : [listingImageSrc(listing.imageUrl, listing.id)];
  const [index, setIndex] = useState(0);
  const active = images[Math.min(index, Math.max(images.length - 1, 0))] || images[0] || '';

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-xl border border-border bg-surface shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lift',
        className,
      )}
    >
      <div
        className={cn(
          'relative bg-surface-muted',
          showPlate ? 'aspect-[700/178]' : 'aspect-[4/3]',
        )}
      >
        <Link href={detailHref} className="absolute inset-0 block">
          {showPlate ? (
            <div className="flex h-full items-center justify-center px-3">
              <LicensePlate
                {...plate}
                framed={false}
                size="fill"
                className="pointer-events-none w-[92%]"
              />
            </div>
          ) : (
            <Image
              src={active}
              alt={listing.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized
            />
          )}
        </Link>

        {!showPlate && images.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/55 px-2 py-1 text-xs text-white group-hover:block"
              onClick={(e) => {
                e.preventDefault();
                setIndex((i) => (i - 1 + images.length) % images.length);
              }}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/55 px-2 py-1 text-xs text-white group-hover:block"
              onClick={(e) => {
                e.preventDefault();
                setIndex((i) => (i + 1) % images.length);
              }}
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
              {images.slice(0, 5).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    i === index ? 'bg-white' : 'bg-white/50',
                  )}
                />
              ))}
            </div>
          </>
        ) : null}

        <button
          type="button"
          aria-label={fav ? 'Remove favorite' : 'Add favorite'}
          onClick={() => toggle(listing.id)}
          className={cn(
            'absolute right-3 top-3 z-10 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur transition',
            fav
              ? 'bg-brand text-white'
              : 'bg-white/95 text-ink hover:bg-white dark:bg-charcoal/90 dark:text-white',
          )}
        >
          {fav ? '♥' : '♡'}
        </button>

        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          {listing.isFeatured ? <Badge tone="brand">Featured</Badge> : null}
          {listing.isVerified ? <Badge tone="success">Verified</Badge> : null}
          {listing.dealerBadge && listing.categoryCode !== 'PLATE' ? (
            <Badge tone="warning">Dealer</Badge>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 p-4">
        <Link href={detailHref} className="block space-y-1">
          <h3 className="line-clamp-2 font-display text-base font-semibold text-ink">
            {listing.title}
          </h3>
          <p className="text-lg font-bold tabular-nums text-brand">
            {formatPrice(listing.price, listing.currencyCode)}
          </p>
          <p className="text-sm text-ink-secondary">
            {showPlate
              ? [listing.location, plate.governorate, plate.type].filter(Boolean).join(' · ')
              : [listing.location, listing.year, formatMileage(listing.mileageKm)]
                  .filter(Boolean)
                  .join(' · ')}
          </p>
        </Link>
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={detailHref}
            className="text-xs font-semibold text-brand hover:underline"
          >
            View details
          </Link>
          <Link
            href={`/search?category=${listing.categoryCode}`}
            className="text-xs font-medium text-ink-secondary hover:text-ink"
          >
            Similar
          </Link>
        </div>
      </div>
    </article>
  );
}
