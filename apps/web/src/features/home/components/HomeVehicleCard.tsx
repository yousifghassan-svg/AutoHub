'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { formatMileage, formatPrice } from '@/features/listings/domain/mappers';
import type { ListingCardModel } from '@/features/listings/domain/types';
import { listingImageSrc } from '@/lib/media/url';
import { Badge, cn } from '@/components/ui';
import { HOME_EASE } from '../lib/motion';

/**
 * Homepage vehicle card language (AX-2 / AX-3).
 * Scoped to home — does not replace production ListingCard elsewhere.
 */
export function HomeVehicleCard({
  listing,
  priority = false,
  className,
}: {
  listing: ListingCardModel;
  priority?: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const href = `/vehicles/${listing.id}`;
  const image = listingImageSrc(
    listing.imageUrls[0] ?? listing.imageUrl,
    listing.id,
  );
  const meta = [listing.year, formatMileage(listing.mileageKm), listing.location]
    .filter(Boolean)
    .join(' · ');

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.35, ease: HOME_EASE }}
      className={cn(
        'group overflow-hidden rounded-2xl bg-surface ring-1 ring-border',
        className,
      )}
    >
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
        <div className="relative aspect-[3/2] overflow-hidden bg-surface-muted">
          <Image
            src={image}
            alt={listing.title}
            fill
            priority={priority}
            className={cn(
              'object-cover',
              !reduceMotion && 'transition duration-700 ease-out group-hover:scale-[1.03]',
            )}
            sizes="(max-width: 768px) 78vw, (max-width: 1200px) 40vw, 360px"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
            aria-hidden
          />
          <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
            {listing.isFeatured ? <Badge tone="brand">Featured</Badge> : null}
            {listing.isVerified ? (
              <span className="inline-flex rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-ink backdrop-blur-sm">
                Verified
              </span>
            ) : null}
          </div>
          <p className="absolute bottom-3 start-3 end-3 font-display text-lg font-semibold tracking-tight text-white drop-shadow-sm sm:text-xl">
            {formatPrice(listing.price, listing.currencyCode)}
          </p>
        </div>
        <div className="space-y-1.5 p-4 sm:p-5">
          <h3 className="line-clamp-2 font-display text-base font-semibold tracking-tight text-ink sm:text-lg">
            {listing.title}
          </h3>
          {meta ? <p className="text-sm text-ink-secondary">{meta}</p> : null}
        </div>
      </Link>
    </motion.article>
  );
}
