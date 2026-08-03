'use client';

import Link from 'next/link';
import { formatMoney } from '@/features/currencies/lib/format-money';
import { cn } from '@/components/ui';
import { marketplaceDetailPath } from '../domain/marketplace-path';
import type { ListingCardModel, MarketplaceDomainCode } from '../domain/types';
import { formatRelativeUpdated } from '../lib/relative-time';
import {
  ListingOwnerActions,
  ListingStats,
  ListingStatusBadge,
  listingStatsFromCounts,
} from '../shared';

type Props = {
  listing: ListingCardModel;
  domain: MarketplaceDomainCode;
  className?: string;
};

export function ManagedListingCard({ listing, domain, className }: Props) {
  const detailHref = marketplaceDetailPath(listing);
  const priceLabel =
    listing.price != null
      ? formatMoney(listing.price, listing.currencyCode || 'IQD', 'en')
      : 'Price not set';

  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card',
        className,
      )}
    >
      <Link href={detailHref} className="relative block aspect-[16/10] bg-surface-muted">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-secondary">
            No cover photo
          </div>
        )}
        <div className="absolute left-3 top-3">
          <ListingStatusBadge status={listing.status} compact />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <Link
            href={detailHref}
            className="font-display text-lg font-semibold text-ink hover:text-brand"
          >
            {listing.title || 'Untitled listing'}
          </Link>
          <p className="text-base font-semibold text-brand">{priceLabel}</p>
          <p className="text-xs text-ink-secondary">
            {listing.location || 'Location not set'}
            {listing.year ? ` · ${listing.year}` : ''}
          </p>
          <p className="text-xs text-ink-secondary">
            {formatRelativeUpdated(listing.updatedAt)}
          </p>
        </div>

        <ListingStats
          metrics={listingStatsFromCounts({
            viewsCount: listing.viewsCount,
            favoritesCount: listing.favoritesCount,
          })}
        />

        <ListingOwnerActions
          listingId={listing.id}
          status={listing.status}
          domain={domain}
          categoryCode={listing.categoryCode}
          surface="manage"
          className="mt-auto border-t border-border pt-3"
        />
      </div>
    </article>
  );
}
