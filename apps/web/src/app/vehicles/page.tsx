'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ListingCard } from '@/components/ListingCard';
import { Button, Card, SectionHeader, Skeleton } from '@/components/ui';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CATEGORIES } from '@/features/listings/domain/types';
import {
  useCatalogFilters,
  useTrending,
} from '@/features/search/hooks/useMarketplaceSearch';
import { useVehiclesPage } from '@/features/vehicles/hooks/useVehicles';

export default function VehiclesHomePage() {
  const featured = useVehiclesPage({ isFeatured: true, pageSize: 6, sortBy: 'publishedAt' });
  const latest = useVehiclesPage({ pageSize: 8, sortBy: 'createdAt' });
  const catalog = useCatalogFilters();
  const trending = useTrending(30, 8);

  const popularBrands = trending.data?.brands?.length
    ? trending.data.brands.slice(0, 8)
    : (catalog.data?.brands ?? []).slice(0, 8);

  const vehicleCategories = useMemo(
    () => CATEGORIES.filter((c) => c.code !== 'PLATE'),
    [],
  );

  return (
    <div className="page-container space-y-14 py-10">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Vehicles' }]} />

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Vehicles marketplace</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Find your next vehicle
          </h1>
          <p className="mt-3 max-w-xl text-ink-secondary">
            Browse cars, motorcycles, trucks, and commercial vehicles from verified sellers and
            dealers across Iraq.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/vehicles/search">
              <Button>Search vehicles</Button>
            </Link>
            <Link href="/sell">
              <Button variant="secondary">Sell a vehicle</Button>
            </Link>
          </div>
        </div>
        <Card className="bg-charcoal-900 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Quick browse</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {vehicleCategories.map((cat) => (
              <Link
                key={cat.code}
                href={`/vehicles/search?category=${cat.code}`}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium hover:bg-white/10"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <section>
        <SectionHeader
          title="Featured vehicles"
          subtitle="Hand-picked and promoted inventory."
          action={
            <Link href="/vehicles/search?featured=1" className="text-sm font-semibold text-brand">
              View all
            </Link>
          }
        />
        {featured.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full" />
            ))}
          </div>
        ) : featured.data?.items.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.data.items.map((item) => (
              <ListingCard key={item.id} listing={item} href={`/vehicles/${item.id}`} />
            ))}
          </div>
        ) : (
          <p className="text-ink-secondary">No featured vehicles yet.</p>
        )}
      </section>

      <section>
        <SectionHeader title="Popular brands" subtitle="What buyers search for most." />
        <div className="flex flex-wrap gap-2">
          {popularBrands.map((b) => (
            <Link
              key={b.id}
              href={`/vehicles/search?brandId=${b.id}`}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-ink hover:border-brand"
            >
              {b.nameEn}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Latest vehicles"
          subtitle="Fresh cars and commercial inventory."
          action={
            <Link href="/vehicles/search" className="text-sm font-semibold text-brand">
              Search all
            </Link>
          }
        />
        {latest.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(latest.data?.items ?? []).map((item) => (
              <ListingCard key={item.id} listing={item} href={`/vehicles/${item.id}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
