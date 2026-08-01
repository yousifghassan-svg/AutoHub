'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { ListingBreadcrumbBuilder, buildRecommendationQuery } from '@/features/listings/shared';
import { VehicleDetailView } from '@/features/vehicles/components/VehicleDetailView';
import { useVehicleDetail, useVehiclesPage } from '@/features/vehicles/hooks/useVehicles';

export default function VehicleDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const query = useVehicleDetail(id);
  const listing = query.data;

  const recommendation = listing
    ? buildRecommendationQuery(listing, 5)
    : null;

  const related = useVehiclesPage(
    {
      categoryCode: recommendation?.categoryCode as
        | 'CAR'
        | 'MOTORCYCLE'
        | 'TRUCK'
        | 'HEAVY_EQUIPMENT'
        | undefined,
      cityId: recommendation?.cityId,
      governorateId: recommendation?.governorateId,
      makeId: recommendation?.makeId,
      pageSize: recommendation?.pageSize ?? 5,
      sortBy: recommendation?.sortBy ?? 'createdAt',
      sortOrder: recommendation?.sortOrder ?? 'desc',
    },
    Boolean(listing?.categoryCode),
  );

  const relatedItems = useMemo(
    () =>
      (related.data?.items ?? [])
        .filter((i) => i.id !== id)
        .slice(0, 4),
    [related.data?.items, id],
  );

  const searchHref = listing?.categoryCode
    ? `/vehicles/search?category=${listing.categoryCode}`
    : '/vehicles/search';

  const breadcrumbs = listing
    ? ListingBreadcrumbBuilder.forListing(listing)
    : [
        { label: 'Home', href: '/' },
        { label: 'Vehicles', href: '/vehicles' },
        { label: 'Vehicle' },
      ];

  return (
    <VehicleDetailView
      query={query}
      breadcrumbs={breadcrumbs}
      backHref="/vehicles"
      searchHref={searchHref}
      cardHref={(vehicleId) => `/vehicles/${vehicleId}`}
      relatedItems={relatedItems}
    />
  );
}
