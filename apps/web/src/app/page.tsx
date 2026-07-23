'use client';

import Link from 'next/link';
import { ListingCard } from '@/components/ListingCard';
import { Button, Skeleton } from '@/components/ui';
import { CATEGORIES } from '@/features/listings/domain/types';
import { useListingsPage } from '@/features/listings/hooks/useListings';

export default function HomePage() {
  const featured = useListingsPage({ isFeatured: true, pageSize: 6, sortBy: 'publishedAt' });
  const latest = useListingsPage({ pageSize: 8, sortBy: 'createdAt' });

  return (
    <>
      <section className="relative isolate overflow-hidden bg-charcoal-900 text-white">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 20% 20%, rgba(200,16,46,0.45), transparent 50%), linear-gradient(160deg, #121212 0%, #1a1a1a 55%, #2a1014 100%)',
          }}
        />
        <div className="page-container relative flex min-h-[72vh] flex-col justify-end pb-16 pt-24 sm:min-h-[78vh]">
          <p className="mb-3 font-display text-4xl font-bold tracking-tight sm:text-6xl">
            AutoHub
          </p>
          <h1 className="max-w-2xl text-xl font-medium text-white/90 sm:text-2xl">
            Iraq’s marketplace for cars, plates, and vehicles.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/70 sm:text-base">
            Browse verified listings, search by category, and sell in minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/search">
              <Button className="bg-brand hover:bg-brand-pressed">Browse listings</Button>
            </Link>
            <Link href="/sell">
              <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                Sell your vehicle
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="page-container py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="section-title">Categories</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.code}
              href={`/search?category=${cat.code}`}
              className="rounded-lg border border-border bg-surface px-4 py-5 text-center shadow-card transition hover:border-brand hover:shadow-lift"
            >
              <p className="font-semibold text-ink">{cat.label}</p>
              <p className="mt-1 font-arabic text-sm text-ink-secondary">{cat.labelAr}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface py-14">
        <div className="page-container">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="section-title">Featured vehicles</h2>
            <Link href="/search?featured=1" className="text-sm font-semibold text-brand">
              View all
            </Link>
          </div>
          {featured.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] w-full" />
              ))}
            </div>
          ) : featured.data?.items.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.data.items.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          ) : (
            <p className="text-ink-secondary">No featured listings yet. Check latest below.</p>
          )}
        </div>
      </section>

      <section className="page-container py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="section-title">Latest listings</h2>
          <Link href="/search" className="text-sm font-semibold text-brand">
            Search
          </Link>
        </div>
        {latest.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full" />
            ))}
          </div>
        ) : latest.data?.items.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latest.data.items.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        ) : (
          <p className="text-ink-secondary">No listings yet. Be the first to sell.</p>
        )}
      </section>
    </>
  );
}
