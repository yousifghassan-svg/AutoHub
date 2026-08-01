'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ListingCard } from '@/components/ListingCard';
import { Badge, Button, Card, EmptyState, Skeleton } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { useFavorites } from '@/features/favorites/favorites-store';
import { formatPrice } from '@/features/listings/domain/mappers';
import type { ListingCardModel, ListingDetailModel } from '@/features/listings/domain/types';
import {
  isListingOwner,
  ListingBreadcrumbBuilder,
  ListingDescription,
  ListingOwnerActions,
  ListingPreviewBanner,
  ListingSellerCard,
  ListingStats,
  ListingStatusBadge,
  listingStatsFromCounts,
  buildRecommendationQuery,
  shareListing,
  useListingPreviewMode,
  whatsappHref,
  YourListingBadge,
} from '@/features/listings/shared';
import { LicensePlate, licensePlateFromListing } from '@/features/plates';
import { usePlateDetail, usePlatesPage } from '@/features/plates/hooks/usePlates';

export default function PlateDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const query = usePlateDetail(id);
  const { isFavorite, toggle } = useFavorites();
  const { session } = useAuth();
  const { previewAsVisitor, enterPreview, exitPreview } = useListingPreviewMode();
  const listing = query.data;

  const recommendation = listing ? buildRecommendationQuery(listing, 8) : null;
  const related = usePlatesPage(
    {
      pageSize: recommendation?.pageSize ?? 8,
      sortBy: recommendation?.sortBy ?? 'createdAt',
      sortOrder: recommendation?.sortOrder ?? 'desc',
      governorateId: recommendation?.governorateId,
      formatCode: recommendation?.formatCode,
    },
    Boolean(listing),
  );

  const relatedItems = useMemo(
    () => (related.data?.items ?? []).filter((i) => i.id !== id).slice(0, 4),
    [related.data?.items, id],
  );

  if (query.isLoading) {
    return (
      <div className="page-container space-y-8 py-10">
        <Skeleton className="aspect-[700/220] w-full max-w-3xl" />
        <Skeleton className="h-40 w-full max-w-lg" />
      </div>
    );
  }

  if (query.isError || !listing) {
    return (
      <div className="page-container py-10">
        <EmptyState
          title="Plate listing not found"
          description={query.error instanceof Error ? query.error.message : undefined}
          action={
            <Link href="/plates">
              <Button variant="secondary">Back to plates</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <PlateDetailBody
      listing={listing}
      relatedItems={relatedItems}
      sessionUserId={session?.user.id}
      previewAsVisitor={previewAsVisitor}
      enterPreview={enterPreview}
      exitPreview={exitPreview}
      isFavorite={isFavorite}
      toggle={toggle}
    />
  );
}

function PlateDetailBody({
  listing,
  relatedItems,
  sessionUserId,
  previewAsVisitor,
  enterPreview,
  exitPreview,
  isFavorite,
  toggle,
}: {
  listing: ListingDetailModel;
  relatedItems: ListingCardModel[];
  sessionUserId: string | undefined;
  previewAsVisitor: boolean;
  enterPreview: () => void;
  exitPreview: () => void;
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
}) {
  const plate = licensePlateFromListing(listing.plateDetails);
  const owner = isListingOwner(sessionUserId, listing.sellerId);
  const showOwnerChrome = owner && !previewAsVisitor;
  const showVisitorChrome = !owner || previewAsVisitor;
  const contact = listing.sellerContact;
  const [shareMsg, setShareMsg] = useState('');

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const result = await shareListing({ title: listing.title, url });
    setShareMsg(result.message ?? (result.ok ? 'Shared' : 'Share failed'));
    setTimeout(() => setShareMsg(''), 2000);
  };

  return (
    <div>
      {previewAsVisitor ? <ListingPreviewBanner onExit={exitPreview} /> : null}
      <div className="page-container space-y-12 py-10">
        <Breadcrumbs items={ListingBreadcrumbBuilder.forListing(listing)} />

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {plate ? (
              <div className="rounded-2xl bg-surface-muted px-3 py-10 dark:bg-charcoal/40 sm:px-8">
                <LicensePlate
                  {...plate}
                  framed={false}
                  size="fill"
                  showExport
                  className="mx-auto w-[92%] max-w-3xl"
                />
                <p className="mt-4 text-center text-sm text-ink-secondary">
                  {plate.code} · {plate.letter} · {plate.number}
                  {plate.governorate ? ` · ${plate.governorate}` : ''}
                </p>
              </div>
            ) : (
              <Card>
                <p className="text-ink-secondary">Plate preview unavailable for this listing.</p>
              </Card>
            )}
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {showOwnerChrome ? <YourListingBadge /> : null}
              {listing.isFeatured ? <Badge tone="brand">Featured</Badge> : null}
              {listing.isVerified ? <Badge tone="success">Verified</Badge> : null}
              <Badge>Plate</Badge>
            </div>
            <ListingStatusBadge status={listing.status} />
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {listing.title}
            </h1>
            <p className="text-3xl font-bold tabular-nums text-brand">
              {formatPrice(listing.price, listing.currencyCode)}
            </p>
            <p className="text-ink-secondary">
              {[listing.location, plate?.governorate, plate?.type].filter(Boolean).join(' · ')}
            </p>

            {showOwnerChrome ? (
              <Card className="space-y-3">
                <p className="text-sm font-semibold text-ink">Manage listing</p>
                <ListingOwnerActions
                  listingId={listing.id}
                  status={listing.status}
                  domain="PLATE"
                  surface="detail"
                  onPreview={enterPreview}
                />
                <Button variant="secondary" onClick={() => void share()}>
                  Share
                </Button>
                {shareMsg ? <p className="text-xs text-ink-secondary">{shareMsg}</p> : null}
              </Card>
            ) : null}

            {showVisitorChrome ? (
              <Card className="space-y-3">
                <p className="text-sm font-semibold text-ink">Contact & actions</p>
                <div className="flex flex-wrap gap-2">
                  {contact?.phone ? (
                    <a href={`tel:${contact.phone}`}>
                      <Button>Call</Button>
                    </a>
                  ) : null}
                  {contact?.whatsapp ? (
                    <a
                      href={whatsappHref(contact.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="secondary">WhatsApp</Button>
                    </a>
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
                  {!contact?.phone && !contact?.whatsapp ? (
                    <Button disabled>Contact unavailable</Button>
                  ) : null}
                </div>
                {shareMsg ? <p className="text-xs text-ink-secondary">{shareMsg}</p> : null}
              </Card>
            ) : null}

            <ListingSellerCard
              sellerContact={listing.sellerContact}
              isVerified={listing.isVerified}
            />
            <ListingStats
              metrics={listingStatsFromCounts({
                viewsCount: listing.viewsCount,
                favoritesCount: listing.favoritesCount,
                phoneClicks: listing.phoneClicks,
                whatsappClicks: listing.whatsappClicks,
              })}
            />
            <ListingDescription description={listing.description} />
          </div>
        </div>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold text-ink">Similar plates</h2>
            <Link href="/plates/search" className="text-sm font-semibold text-brand">
              Search plates
            </Link>
          </div>
          {relatedItems.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedItems.map((item) => (
                <ListingCard key={item.id} listing={item} href={`/plates/${item.id}`} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-secondary">No similar plates listed yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
