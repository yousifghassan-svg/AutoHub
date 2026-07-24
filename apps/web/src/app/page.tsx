'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import { ListingCard } from '@/components/ListingCard';
import { Button, Card, Input, SectionHeader, Skeleton } from '@/components/ui';
import { dealerActiveCount } from '@/features/dealers/data/dealers.repository';
import { useDealers } from '@/features/dealers/hooks/useDealers';
import { CATEGORIES } from '@/features/listings/domain/types';
import { useListingsPage } from '@/features/listings/hooks/useListings';
import { LicensePlate, licensePlateFromListing } from '@/features/plates';
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
  const router = useRouter();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const featured = useListingsPage({ isFeatured: true, pageSize: 6, sortBy: 'publishedAt' });
  const latest = useListingsPage({ pageSize: 8, sortBy: 'createdAt' });
  const plates = useListingsPage({ categoryCode: 'PLATE', pageSize: 6, sortBy: 'createdAt' });
  const dealers = useDealers({ pageSize: 6, verifiedOnly: true });
  const catalog = useCatalogFilters();
  const trending = useTrending(30, 8);

  const stats = useMemo(() => {
    const total = latest.data?.total ?? 0;
    const plateTotal = plates.data?.total ?? 0;
    const dealerTotal = dealers.data?.total ?? 0;
    return [
      { label: 'Active listings', value: total },
      { label: 'License plates', value: plateTotal },
      { label: 'Premium dealers', value: dealerTotal },
      { label: 'Cities covered', value: catalog.data?.cities.length ?? 0 },
    ];
  }, [latest.data?.total, plates.data?.total, dealers.data?.total, catalog.data?.cities.length]);

  const popularCities = (catalog.data?.cities ?? []).slice(0, 8);
  const popularBrands = trending.data?.brands?.length
    ? trending.data.brands.slice(0, 8)
    : (catalog.data?.brands ?? []).slice(0, 8);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (category) params.set('category', category);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <>
      <section className="relative isolate overflow-hidden bg-charcoal-900 text-white">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 15% 10%, rgba(200,16,46,0.5), transparent 45%), radial-gradient(ellipse at 85% 80%, rgba(255,255,255,0.08), transparent 40%), linear-gradient(165deg, #0c0c0f 0%, #17171c 55%, #2a1014 100%)',
          }}
        />
        <div className="page-container relative grid min-h-[78vh] items-end gap-10 pb-16 pt-24 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-4 font-display text-5xl font-bold tracking-tight sm:text-7xl">
              AutoHub
            </p>
            <h1 className="max-w-xl text-xl font-medium text-white/90 sm:text-2xl">
              Iraq’s professional marketplace for cars, plates, and dealers.
            </h1>
            <p className="mt-3 max-w-lg text-sm text-white/65 sm:text-base">
              Search verified inventory, compare prices, and sell with a guided flow built for the
              local market.
            </p>
            <form
              onSubmit={onSearch}
              className="mt-8 grid gap-2 rounded-2xl bg-white/95 p-3 text-ink shadow-lift sm:grid-cols-[1.4fr_1fr_auto]"
            >
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Make, model, plate, city…"
                aria-label="Search keyword"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 rounded-md border border-border bg-surface px-3 text-sm"
                aria-label="Category"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <Button type="submit" className="h-11">
                Search
              </Button>
            </form>
            <div className="mt-5 flex flex-wrap gap-2">
              {CATEGORIES.slice(0, 4).map((c) => (
                <Link
                  key={c.code}
                  href={`/search?category=${c.code}`}
                  className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 hover:bg-white/10"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:block">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Live marketplace
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl bg-black/25 p-4">
                  <p className="text-2xl font-bold tabular-nums">{s.value.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-white/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-14">
        <SectionHeader title="Browse by category" subtitle="Start with the vehicle type you need." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.code}
              href={`/search?category=${cat.code}`}
              className="rounded-xl border border-border bg-surface px-4 py-5 text-center shadow-card transition hover:-translate-y-0.5 hover:border-brand hover:shadow-lift"
            >
              <p className="font-semibold text-ink">{cat.label}</p>
              <p className="mt-1 font-arabic text-sm text-ink-secondary">{cat.labelAr}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface py-14">
        <div className="page-container">
          <SectionHeader
            title="Featured vehicles"
            subtitle="Hand-picked and promoted inventory."
            action={
              <Link href="/search?featured=1" className="text-sm font-semibold text-brand">
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
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          ) : (
            <p className="text-ink-secondary">No featured listings yet.</p>
          )}
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
                  href={`/search?brandId=${b.id}`}
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
                  href={`/search?cityId=${c.id}`}
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
          title="Recently added"
          subtitle="Fresh inventory across the marketplace."
          action={
            <Link href="/search" className="text-sm font-semibold text-brand">
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
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
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
        <SectionHeader title="Marketplace snapshot" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <p className="text-3xl font-bold tabular-nums text-ink">{s.value.toLocaleString()}</p>
              <p className="mt-1 text-sm text-ink-secondary">{s.label}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-surface py-14">
        <div className="page-container">
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
        </div>
      </section>

      <section className="page-container py-16">
        <div className="overflow-hidden rounded-2xl bg-charcoal-900 px-8 py-12 text-white sm:px-12">
          <p className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to sell your vehicle?
          </p>
          <p className="mt-3 max-w-xl text-white/70">
            Create a listing with photos, specs, or an Iraqi plate preview — and reach buyers across
            the country.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/sell">
              <Button>Start selling</Button>
            </Link>
            <Link href="/dealers">
              <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                Explore dealers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
