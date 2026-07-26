'use client';

import Link from 'next/link';
import { ListingCard } from '@/components/ListingCard';
import { Button, Card, SectionHeader, Skeleton } from '@/components/ui';
import { dealerActiveCount } from '@/features/dealers/data/dealers.repository';
import { useDealers } from '@/features/dealers/hooks/useDealers';
import { LicensePlate, licensePlateFromListing } from '@/features/plates';
import { useVehiclesPage } from '@/features/vehicles/hooks/useVehicles';
import { usePlatesPage } from '@/features/plates/hooks/usePlates';
import {
  useCatalogFilters,
  useTrending,
} from '@/features/search/hooks/useMarketplaceSearch';

const WHY = [
  {
    title: 'Verified inventory',
    body: 'Listings and dealers are moderated so buyers can shop with confidence.',
  },
  {
    title: 'Built for Iraq',
    body: 'Governorate search, IQD pricing, and authentic Iraqi plate previews.',
  },
  {
    title: 'Sell in minutes',
    body: 'Guided listing flow for cars, plates, and commercial vehicles.',
  },
  {
    title: 'Dealer-ready',
    body: 'Public showrooms, inventory pages, and trust signals for professionals.',
  },
];

export default function HomePage() {
  const featuredVehicles = useVehiclesPage({ isFeatured: true, pageSize: 6, sortBy: 'publishedAt' });
  const latestVehicles = useVehiclesPage({ pageSize: 4, sortBy: 'createdAt' });
  const plates = usePlatesPage({ pageSize: 6, sortBy: 'createdAt' });
  const dealers = useDealers({ pageSize: 6, verifiedOnly: true });
  const catalog = useCatalogFilters();
  const trending = useTrending(30, 8);

  const stats = [
    { label: 'Active vehicles', value: latestVehicles.data?.total ?? 0 },
    { label: 'License plates', value: plates.data?.total ?? 0 },
    { label: 'Premium dealers', value: dealers.data?.total ?? 0 },
    { label: 'Cities covered', value: catalog.data?.cities.length ?? 0 },
  ];

  const popularCities = (catalog.data?.cities ?? []).slice(0, 8);
  const popularBrands = trending.data?.brands?.length
    ? trending.data.brands.slice(0, 8)
    : (catalog.data?.brands ?? []).slice(0, 8);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-charcoal-900 text-white">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 20% 0%, rgba(200,16,46,0.35), transparent 50%), linear-gradient(165deg, #0c0c0f 0%, #17171c 60%, #1a1214 100%)',
          }}
        />
        <div className="page-container relative py-20 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-display text-5xl font-bold tracking-tight sm:text-6xl">AutoHub</p>
            <h1 className="mt-4 text-xl font-medium text-white/90 sm:text-2xl">
              Iraq’s marketplace for vehicles and license plates.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/65 sm:text-base">
              Two focused marketplaces on one platform — shop cars and commercial vehicles, or browse
              authentic Iraqi plate listings.
            </p>
            <div className="mt-10 grid gap-3 sm:mx-auto sm:max-w-xl sm:grid-cols-2">
              <Link
                href="/vehicles"
                className="rounded-xl border border-white/15 bg-white/5 px-6 py-5 text-left transition hover:border-brand/60 hover:bg-white/10"
              >
                <p className="font-display text-lg font-semibold">Vehicles marketplace</p>
                <p className="mt-1 text-sm text-white/65">Cars, bikes, trucks & equipment</p>
              </Link>
              <Link
                href="/plates"
                className="rounded-xl border border-white/15 bg-white/5 px-6 py-5 text-left transition hover:border-brand/60 hover:bg-white/10"
              >
                <p className="font-display text-lg font-semibold">Plates marketplace</p>
                <p className="mt-1 text-sm text-white/65">Iraqi license plates by governorate</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-14">
        <SectionHeader
          title="Featured vehicles"
          subtitle="Hand-picked and promoted inventory."
          action={
            <Link href="/vehicles/search?featured=1" className="text-sm font-semibold text-brand">
              View all
            </Link>
          }
        />
        {featuredVehicles.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full" />
            ))}
          </div>
        ) : featuredVehicles.data?.items.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredVehicles.data.items.map((item) => (
              <ListingCard key={item.id} listing={item} href={`/vehicles/${item.id}`} />
            ))}
          </div>
        ) : (
          <p className="text-ink-secondary">No featured vehicles yet.</p>
        )}
      </section>

      <section className="bg-surface py-14">
        <div className="page-container">
          <SectionHeader
            title="Latest license plates"
            subtitle="Authentic Iraqi plate previews."
            action={
              <Link href="/plates" className="text-sm font-semibold text-brand">
                Browse plates
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(plates.data?.items ?? []).map((item) => {
              const plate = licensePlateFromListing(item.plateDetails);
              return (
                <Link
                  key={item.id}
                  href={`/plates/${item.id}`}
                  className="rounded-xl border border-border bg-background p-4 shadow-card transition hover:shadow-lift"
                >
                  {plate ? (
                    <LicensePlate {...plate} framed={false} size="fill" className="w-full" />
                  ) : (
                    <p className="font-semibold text-ink">{item.title}</p>
                  )}
                  <p className="mt-3 text-sm font-bold text-brand">
                    {item.price?.toLocaleString()} {item.currencyCode}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-container py-14">
        <SectionHeader
          title="Premium dealers"
          subtitle="Trusted showrooms with active inventory."
          action={
            <Link href="/dealers" className="text-sm font-semibold text-brand">
              All dealers
            </Link>
          }
        />
        {dealers.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(dealers.data?.items ?? []).map((d) => (
              <Link key={d.id} href={`/dealers/${d.slug}`}>
                <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-lift">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-semibold text-ink">{d.name}</p>
                      <p className="mt-1 text-sm text-ink-secondary">
                        {d.city?.nameEn ?? d.city?.nameAr ?? 'Iraq'}
                      </p>
                    </div>
                    {d.verified ? (
                      <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                        Verified
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm text-ink-secondary">
                    {d.bio || 'Professional dealer on AutoHub.'}
                  </p>
                  <p className="mt-4 text-xs font-semibold text-brand">
                    {dealerActiveCount(d)} active listings
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-surface py-14">
        <div className="page-container grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader title="Popular brands" subtitle="What buyers search for most." />
            <div className="flex flex-wrap gap-2">
              {popularBrands.map((b) => (
                <Link
                  key={b.id}
                  href={`/vehicles/search?brandId=${b.id}`}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-ink hover:border-brand"
                >
                  {b.nameEn}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <SectionHeader title="Popular cities" subtitle="Shop inventory near you." />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {popularCities.map((c) => (
                <Link
                  key={c.id}
                  href={`/vehicles/search?cityId=${c.id}`}
                  className="rounded-lg border border-border bg-background px-3 py-3 text-sm font-medium text-ink hover:border-brand"
                >
                  {c.nameEn}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-14">
        <SectionHeader
          title="Recently added vehicles"
          subtitle="Fresh cars and commercial inventory."
          action={
            <Link href="/vehicles/search" className="text-sm font-semibold text-brand">
              Search vehicles
            </Link>
          }
        />
        {latestVehicles.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(latestVehicles.data?.items ?? []).map((item) => (
              <ListingCard key={item.id} listing={item} href={`/vehicles/${item.id}`} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-surface py-14">
        <div className="page-container">
          <SectionHeader title="Marketplace snapshot" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <Card key={s.label}>
                <p className="text-3xl font-bold tabular-nums text-ink">{s.value.toLocaleString()}</p>
                <p className="mt-1 text-sm text-ink-secondary">{s.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container py-14">
        <SectionHeader
          title="Why choose AutoHub"
          subtitle="A marketplace designed for serious buyers and sellers."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {WHY.map((item) => (
            <Card key={item.title}>
              <p className="font-display text-lg font-semibold text-ink">{item.title}</p>
              <p className="mt-2 text-sm text-ink-secondary">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="page-container py-16">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-charcoal-900 px-8 py-10 text-white">
            <p className="font-display text-2xl font-bold tracking-tight">Sell a vehicle</p>
            <p className="mt-2 text-sm text-white/70">
              Create a listing with photos and specs — reach buyers across Iraq.
            </p>
            <Link href="/sell" className="mt-6 inline-block">
              <Button>List a vehicle</Button>
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface px-8 py-10">
            <p className="font-display text-2xl font-bold tracking-tight text-ink">Sell a plate</p>
            <p className="mt-2 text-sm text-ink-secondary">
              Preview your Iraqi plate with our SVG renderer before publishing.
            </p>
            <Link href="/sell" className="mt-6 inline-block">
              <Button variant="secondary">List a plate</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
