'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/Breadcrumbs';
import { ListingCard } from '@/components/ListingCard';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  Select,
  Skeleton,
  TextArea,
} from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { createChatRepository } from '@/features/chat/data/chat.repository';
import { useFavorites } from '@/features/favorites/favorites-store';
import { createListingsRepository } from '@/features/listings/data/listings.repository';
import { formatMileage, formatPrice } from '@/features/listings/domain/mappers';
import {
  REPORT_REASONS,
  type ListingCardModel,
  type ListingDetailModel,
  type ReportReason,
} from '@/features/listings/domain/types';
import { createVehiclesRepository } from '@/features/vehicles/data/vehicles.repository';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import { getHttpClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { listingImageSrc, mediaPublicUrl } from '@/lib/media/url';
import { config } from '@/lib/config';

const VehicleGallery = dynamic(
  () => import('@/features/media').then((m) => m.VehicleGallery),
  {
    ssr: false,
    loading: () => <Skeleton className="aspect-[4/3] w-full" />,
  },
);

function labelFromCatalog(
  id: string | null | undefined,
  rows: Array<{ id: string; nameEn: string }> | undefined,
) {
  if (!id || !rows) return null;
  return rows.find((r) => r.id === id)?.nameEn ?? null;
}

function formatEngineSize(cc: number | null | undefined): string | null {
  if (cc == null) return null;
  if (cc >= 1000) return `${(cc / 1000).toFixed(1)} L`;
  return `${cc.toLocaleString()} cc`;
}

function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}`;
}

function openStreetMapEmbed(lat: number, lng: number): string {
  const bbox = `${lng - 0.02},${lat - 0.02},${lng + 0.02},${lat + 0.02}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

function vehiclesRepo() {
  return createVehiclesRepository(getHttpClient());
}

function listingsRepo() {
  return createListingsRepository(getHttpClient());
}

export type VehicleDetailViewProps = {
  query: UseQueryResult<ListingDetailModel, Error>;
  breadcrumbs: BreadcrumbItem[];
  backHref: string;
  searchHref: string;
  cardHref: (id: string) => string;
  relatedItems: ListingCardModel[];
};

export function VehicleDetailView({
  query,
  breadcrumbs,
  backHref,
  searchHref,
  cardHref,
  relatedItems,
}: VehicleDetailViewProps) {
  const router = useRouter();
  const catalog = useCatalogFilters();
  const { isFavorite, toggle } = useFavorites();
  const { status } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('SPAM');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [shareMsg, setShareMsg] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const listing = query.data;

  const canReport = status === 'authenticated';

  const specs = useMemo(() => {
    if (!listing?.specs || !catalog.data) return [] as Array<{ label: string; value: string }>;
    const rows: Array<{ label: string; value: string }> = [];
    const brand = labelFromCatalog(listing.specs.brandId, catalog.data.brands);
    const model = labelFromCatalog(listing.specs.modelId, catalog.data.models);
    const body = labelFromCatalog(listing.specs.bodyTypeId, catalog.data.bodyTypes);
    const drive = labelFromCatalog(listing.specs.driveTypeId, catalog.data.driveTypes);
    const fuel = labelFromCatalog(listing.specs.fuelTypeId, catalog.data.fuelTypes);
    const transmission = labelFromCatalog(
      listing.specs.transmissionTypeId,
      catalog.data.transmissionTypes,
    );
    const color = labelFromCatalog(listing.specs.colorId, catalog.data.colors);
    const engineSize = formatEngineSize(listing.specs.engineSizeCc);
    const location = listing.locationText ?? listing.location;

    if (brand) rows.push({ label: 'Brand', value: brand });
    if (model) rows.push({ label: 'Model', value: model });
    if (body) rows.push({ label: 'Body', value: body });
    if (drive) rows.push({ label: 'Drive', value: drive });
    if (listing.specs.trim) rows.push({ label: 'Trim', value: listing.specs.trim });
    if (engineSize) rows.push({ label: 'Engine', value: engineSize });
    if (fuel) rows.push({ label: 'Fuel', value: fuel });
    if (transmission) rows.push({ label: 'Transmission', value: transmission });
    if (color) rows.push({ label: 'Color', value: color });
    if (listing.specs.doors) rows.push({ label: 'Doors', value: String(listing.specs.doors) });
    if (listing.specs.seats) rows.push({ label: 'Seats', value: String(listing.specs.seats) });
    if (listing.year) rows.push({ label: 'Year', value: String(listing.year) });
    if (listing.mileageKm != null)
      rows.push({ label: 'Mileage', value: formatMileage(listing.mileageKm) ?? '—' });
    if (location) rows.push({ label: 'Location', value: location });
    return rows;
  }, [listing, catalog.data]);

  const recordContactClick = (channel: 'phone' | 'whatsapp') => {
    if (!listing) return;
    void vehiclesRepo()
      .contactClick(listing.id, channel)
      .catch(() => undefined);
  };

  const submitReport = async () => {
    if (!listing || !canReport) return;
    setReportSubmitting(true);
    setReportError(null);
    try {
      await listingsRepo().createReport({
        listingId: listing.id,
        reason: reportReason,
        details: reportDetails.trim() || undefined,
      });
      setReportOpen(false);
      setReportDetails('');
      setReportReason('SPAM');
      setShareMsg('Report submitted');
      setTimeout(() => setShareMsg(''), 2500);
    } catch (e) {
      setReportError(e instanceof ApiError ? e.message : 'Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

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
      <div className="page-container py-10">
        <EmptyState
          title="Vehicle not found"
          description={query.error instanceof Error ? query.error.message : undefined}
          action={
            <Link href={backHref}>
              <Button variant="secondary">Back to vehicles</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const contact = listing.sellerContact;
  const dealerLogo = mediaPublicUrl(contact?.dealerLogoUrl);
  const galleryItems = listing.media.length
    ? listing.media.map((m) => ({
        id: m.id,
        url: m.url,
        kind: m.kind,
        blurDataUrl: m.blurDataUrl,
        variants: m.variants,
        isPrimary: m.isPrimary,
      }))
    : [
        {
          id: listing.id,
          url: listingImageSrc(listing.imageUrl, listing.id),
          kind: 'IMAGE' as const,
        },
      ];

  const mapUrl =
    listing.latitude != null && listing.longitude != null
      ? openStreetMapEmbed(listing.latitude, listing.longitude)
      : null;

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareMsg('Link copied');
        setTimeout(() => setShareMsg(''), 2000);
      }
    } catch {
      setShareMsg('Share cancelled');
      setTimeout(() => setShareMsg(''), 2000);
    }
  };

  return (
    <div className="page-container space-y-12 py-10">
      <Breadcrumbs items={breadcrumbs} />

      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-3">
          <VehicleGallery items={galleryItems} title={listing.title} />
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {listing.isFeatured ? <Badge tone="brand">Featured</Badge> : null}
            {listing.isVerified ? <Badge tone="success">Verified</Badge> : null}
            <Badge>{listing.categoryCode}</Badge>
            {listing.dealerBadge ? <Badge tone="warning">Dealer</Badge> : null}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {listing.title}
          </h1>
          <p className="text-3xl font-bold tabular-nums text-brand">
            {formatPrice(listing.price, listing.currencyCode)}
          </p>
          <p className="text-ink-secondary">
            {[listing.locationText ?? listing.location, listing.year, formatMileage(listing.mileageKm)]
              .filter(Boolean)
              .join(' · ')}
          </p>

          <Card className="space-y-3">
            <p className="text-sm font-semibold text-ink">Contact & actions</p>
            <div className="flex flex-wrap gap-2">
              {contact?.phone ? (
                <a href={`tel:${contact.phone}`} onClick={() => recordContactClick('phone')}>
                  <Button>Call</Button>
                </a>
              ) : null}
              {contact?.whatsapp ? (
                <a
                  href={whatsappHref(contact.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => recordContactClick('whatsapp')}
                >
                  <Button variant="secondary">WhatsApp</Button>
                </a>
              ) : null}
              {!contact?.phone && !contact?.whatsapp ? (
                <Button disabled>Contact unavailable</Button>
              ) : null}
              <Button
                variant={isFavorite(listing.id) ? 'primary' : 'secondary'}
                onClick={() => toggle(listing.id)}
              >
                {isFavorite(listing.id) ? 'Saved' : 'Favorite'}
              </Button>
              <Button variant="secondary" onClick={() => void share()}>
                Share
              </Button>
              <Button
                variant="secondary"
                disabled={chatBusy}
                onClick={() => {
                  if (!listing) return;
                  if (status !== 'authenticated') {
                    router.push(`/login?next=/vehicles/${listing.id}`);
                    return;
                  }
                  setChatBusy(true);
                  setChatError(null);
                  void createChatRepository(getHttpClient())
                    .startListingChat(listing.id, {
                      type: 'TEXT',
                      body: `Hi, I'm interested in ${listing.title}`,
                    })
                    .then((c) => router.push(`/messages/${c.id}`))
                    .catch((err: unknown) =>
                      setChatError(err instanceof Error ? err.message : 'Could not start chat'),
                    )
                    .finally(() => setChatBusy(false));
                }}
              >
                {chatBusy ? 'Opening…' : 'Message seller'}
              </Button>
              <Button variant="ghost" onClick={() => setReportOpen(true)}>
                Report
              </Button>
            </div>
            {shareMsg ? <p className="text-xs text-ink-secondary">{shareMsg}</p> : null}
            {chatError ? <p className="text-xs text-error">{chatError}</p> : null}
          </Card>

          {contact?.dealerSlug ? (
            <Link href={`/dealers/${contact.dealerSlug}`}>
              <Card className="transition hover:border-brand/40">
                <div className="flex items-center gap-4">
                  {dealerLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={dealerLogo}
                      alt=""
                      className="h-14 w-14 rounded-xl border border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-soft text-lg font-bold text-brand">
                      {(contact.dealerName ?? 'D').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">{contact.dealerName ?? 'Dealer'}</p>
                      {contact.dealerVerified ? (
                        <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                          Verified
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-ink-secondary">View dealer profile</p>
                  </div>
                </div>
              </Card>
            </Link>
          ) : (
            <Card>
              <p className="mb-2 text-sm font-semibold text-ink">Seller</p>
              <p className="text-sm text-ink-secondary">
                {contact?.displayName
                  ? contact.displayName
                  : listing.isVerified
                    ? 'Verified seller on AutoHub.'
                    : 'Private seller listing.'}
              </p>
              <Link href="/dealers" className="mt-3 inline-block text-sm font-semibold text-brand">
                Browse dealers
              </Link>
            </Card>
          )}

          <p className="text-xs text-ink-secondary">
            Views {listing.viewsCount ?? '—'} · Favorites {listing.favoritesCount ?? '—'}
          </p>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl font-semibold text-ink">Description</h2>
          <p className="mt-3 whitespace-pre-wrap text-ink">
            {listing.description || 'No description provided.'}
          </p>
        </Card>
        <Card>
          <h2 className="font-display text-xl font-semibold text-ink">Specifications</h2>
          {specs.length ? (
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {specs.map((row) => (
                <div key={row.label} className="rounded-lg bg-surface-muted px-3 py-2">
                  <dt className="text-ink-secondary">{row.label}</dt>
                  <dd className="font-semibold text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-sm text-ink-secondary">Specifications unavailable.</p>
          )}
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl font-semibold text-ink">Equipment</h2>
          {(listing.features ?? []).length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {(listing.features ?? []).map((feature) => (
                <li
                  key={feature}
                  className="rounded-full bg-surface-muted px-3 py-1 text-sm font-medium text-ink"
                >
                  {feature}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-secondary">No equipment listed.</p>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-xl font-semibold text-ink">Location</h2>
          {mapUrl ? (
            <div className="mt-4 space-y-3">
              {listing.locationText ? (
                <p className="text-sm text-ink-secondary">{listing.locationText}</p>
              ) : null}
              <iframe
                title="Listing location map"
                src={mapUrl}
                className="h-56 w-full rounded-xl border border-border"
                loading="lazy"
              />
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink-secondary">
              {listing.locationText ?? listing.location ?? 'Location not available.'}
            </p>
          )}
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">Related vehicles</h2>
          <Link href={searchHref} className="text-sm font-semibold text-brand">
            See more
          </Link>
        </div>
        {relatedItems.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedItems.map((item) => (
              <ListingCard key={item.id} listing={item} href={cardHref(item.id)} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-secondary">No related listings yet.</p>
        )}
      </section>

      <Modal open={reportOpen} title="Report listing" onClose={() => setReportOpen(false)}>
        <p className="text-sm text-ink-secondary">
          Thanks for helping keep AutoHub safe. Our moderation team reviews reports for fraud,
          misrepresentation, and policy violations.
        </p>
        {!canReport ? (
          <p className="mt-4 rounded-md bg-brand-soft px-4 py-3 text-sm text-brand">
            {config.authMode === 'mock'
              ? 'Mock auth cannot submit reports. Switch to NEXT_PUBLIC_AUTH_MODE=api and sign in.'
              : 'Sign in to submit a report.'}{' '}
            <Link href="/login" className="font-semibold underline">
              Log in
            </Link>
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <Select
              label="Reason"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value as ReportReason)}
            >
              {REPORT_REASONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <TextArea
              label="Details (optional)"
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Describe the issue…"
            />
            {reportError ? <p className="text-sm text-error">{reportError}</p> : null}
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setReportOpen(false)}>
            Cancel
          </Button>
          <Button disabled={!canReport || reportSubmitting} onClick={() => void submitReport()}>
            {reportSubmitting ? 'Submitting…' : 'Submit report'}
          </Button>
        </div>
      </Modal>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Vehicle',
            name: listing.title,
            description: listing.description,
            offers: {
              '@type': 'Offer',
              price: listing.price,
              priceCurrency: listing.currencyCode,
              availability: 'https://schema.org/InStock',
            },
            mileageFromOdometer: listing.mileageKm
              ? { '@type': 'QuantitativeValue', value: listing.mileageKm, unitCode: 'KMT' }
              : undefined,
          }),
        }}
      />
    </div>
  );
}
