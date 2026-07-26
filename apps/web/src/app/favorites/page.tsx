'use client';

import { useQueries } from '@tanstack/react-query';
import Link from 'next/link';
import { ListingCard } from '@/components/ListingCard';
import { Button, EmptyState, Skeleton } from '@/components/ui';
import { useFavorites } from '@/features/favorites/favorites-store';
import { getHttpClient } from '@/lib/api/client';
import { createListingsRepository } from '@/features/listings/data/listings.repository';

export default function FavoritesPage() {
  const { ids, remove, hydrated } = useFavorites();

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['listing', id],
      queryFn: () => createListingsRepository(getHttpClient()).getById(id),
      enabled: hydrated && ids.length > 0,
      retry: false,
    })),
  });

  const listings = queries
    .map((q) => q.data)
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  if (!hydrated) {
    return (
      <div className="page-container grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <h1 className="section-title mb-2">Favorites</h1>
      <p className="mb-8 text-ink-secondary">
        Saved on this device (no favorites API yet). Listing details load from Nest.
      </p>

      {ids.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          description="Tap the heart on any listing card to save it here."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/vehicles/search">
                <Button>Browse vehicles</Button>
              </Link>
              <Link href="/plates/search">
                <Button variant="secondary">Browse plates</Button>
              </Link>
            </div>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div key={listing.id} className="space-y-2">
              <ListingCard listing={listing} />
              <Button
                variant="ghost"
                className="h-9 w-full text-xs"
                onClick={() => remove(listing.id)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
