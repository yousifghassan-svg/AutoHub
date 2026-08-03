'use client';

import { useMemo } from 'react';
import { useCatalogFilters } from '@/features/search/hooks/useMarketplaceSearch';
import { HomeDoorways } from './components/HomeDoorways';
import { HomeHero } from './components/HomeHero';
import { HomeSellBand } from './components/HomeSellBand';
import { HomeVehicleSection } from './components/HomeVehicleSection';

function matchCatalogId(
  rows: Array<{ id: string; code: string; nameEn: string }> | undefined,
  needles: string[],
): string | undefined {
  if (!rows?.length) return undefined;
  const normalized = needles.map((n) => n.toLowerCase());
  const hit = rows.find((row) => {
    const code = row.code.toLowerCase();
    const name = row.nameEn.toLowerCase();
    return normalized.some((n) => code.includes(n) || name.includes(n));
  });
  return hit?.id;
}

/**
 * AX-3 Homepage — visual identity only.
 * Uses existing vehicles list/search endpoints; does not change marketplace behavior.
 */
export function HomePageView() {
  const catalog = useCatalogFilters();

  const electricFuelId = useMemo(
    () =>
      matchCatalogId(catalog.data?.fuelTypes, [
        'electric',
        'ev',
        'battery',
        'hybrid',
      ]),
    [catalog.data?.fuelTypes],
  );

  const suvBodyId = useMemo(
    () =>
      matchCatalogId(catalog.data?.bodyTypes, ['suv', 'crossover', 'sport utility']),
    [catalog.data?.bodyTypes],
  );

  const catalogReady = !catalog.isLoading;

  return (
    <div className="bg-background dark:bg-[#0E1114]">
      <HomeHero />

      <HomeVehicleSection
        id="featured"
        title="Featured"
        subtitle="Selected for presence, not volume."
        viewAllHref="/vehicles/search?featured=1"
        eager
        mode="list"
        query={{ isFeatured: true, sortBy: 'publishedAt', pageSize: 6 }}
      />

      <HomeVehicleSection
        id="latest"
        title="Latest"
        subtitle="Fresh inventory just arrived."
        viewAllHref="/vehicles/search?sortBy=createdAt&sortOrder=desc"
        mode="list"
        query={{ sortBy: 'createdAt', pageSize: 6 }}
      />

      <HomeVehicleSection
        id="recommended"
        title="Recommended"
        subtitle="Worth a closer look right now."
        viewAllHref="/vehicles/search"
        mode="list"
        query={{ sortBy: 'publishedAt', pageSize: 6 }}
      />

      <HomeVehicleSection
        id="luxury"
        title="Luxury"
        subtitle="Higher presence. Quiet confidence."
        viewAllHref="/vehicles/search?sortBy=primaryPrice&sortOrder=desc"
        mode="list"
        query={{ sortBy: 'primaryPrice', sortOrder: 'desc', pageSize: 6 }}
      />

      <HomeVehicleSection
        id="electric"
        title="Electric"
        subtitle="Quiet power. Modern drive."
        viewAllHref={
          electricFuelId
            ? `/vehicles/search?fuelTypeId=${electricFuelId}`
            : '/vehicles/search?q=electric'
        }
        mode="search"
        queryReady={catalogReady}
        query={
          electricFuelId
            ? { fuelTypeId: electricFuelId, pageSize: 6 }
            : { keyword: 'electric', pageSize: 6 }
        }
      />

      <HomeVehicleSection
        id="suv"
        title="SUV"
        subtitle="Space, stance, and road presence."
        viewAllHref={
          suvBodyId
            ? `/vehicles/search?bodyTypeId=${suvBodyId}`
            : '/vehicles/search?q=SUV'
        }
        mode="search"
        queryReady={catalogReady}
        query={
          suvBodyId
            ? { bodyTypeId: suvBodyId, pageSize: 6 }
            : { keyword: 'SUV', pageSize: 6 }
        }
      />

      <HomeDoorways />
      <HomeSellBand />
    </div>
  );
}
