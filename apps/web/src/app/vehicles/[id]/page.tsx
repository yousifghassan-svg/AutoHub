'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { VehicleDetailView } from '@/features/vehicles/components/VehicleDetailView';
import { useVehicleDetail, useVehiclesPage } from '@/features/vehicles/hooks/useVehicles';

export default function VehicleDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const query = useVehicleDetail(id);
  const listing = query.data;

  const related = useVehiclesPage(
    {
      categoryCode: listing?.categoryCode,
      pageSize: 5,
      sortBy: 'createdAt',
    },
    Boolean(listing?.categoryCode),
  );

  const relatedItems = useMemo(
    () => (related.data?.items ?? []).filter((i) => i.id !== id).slice(0, 4),
    [related.data?.items, id],
  );

  const searchHref = listing?.categoryCode
    ? `/vehicles/search?category=${listing.categoryCode}`
    : '/vehicles/search';

  return (
    <VehicleDetailView
      query={query}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Vehicles', href: '/vehicles' },
        { label: listing?.title ?? 'Vehicle' },
      ]}
      backHref="/vehicles"
      searchHref={searchHref}
      cardHref={(vehicleId) => `/vehicles/${vehicleId}`}
      relatedItems={relatedItems}
    />
  );
}
