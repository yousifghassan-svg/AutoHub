import { config } from '@/lib/config';

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
};

async function fetchApi<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${config.apiUrl}${path}`, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiEnvelope<T> | T;
    if (json && typeof json === 'object' && 'data' in json) {
      return (json as ApiEnvelope<T>).data ?? null;
    }
    return json as T;
  } catch {
    return null;
  }
}

export type SeoListing = {
  id: string;
  title?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  primaryPrice?: number | null;
  imageUrl?: string | null;
  thumbnailKey?: string | null;
  translations?: Array<{ title?: string; description?: string }>;
};

export type SeoDealer = {
  slug: string;
  name: string;
  bio?: string | null;
  coverImageUrl?: string | null;
  logoUrl?: string | null;
};

export async function fetchListingForSeo(id: string): Promise<SeoListing | null> {
  return fetchApi<SeoListing>(`/v1/listings/${encodeURIComponent(id)}`);
}

export async function fetchVehicleForSeo(id: string): Promise<SeoListing | null> {
  return fetchApi<SeoListing>(`/v1/vehicles/${encodeURIComponent(id)}`);
}

export async function fetchPlateForSeo(id: string): Promise<SeoListing | null> {
  return fetchApi<SeoListing>(`/v1/plates/${encodeURIComponent(id)}`);
}

export async function fetchDealerForSeo(slug: string): Promise<SeoDealer | null> {
  return fetchApi<SeoDealer>(`/v1/dealers/${encodeURIComponent(slug)}`);
}

export type SitemapMarketItem = {
  id: string;
  domain: 'VEHICLE' | 'PLATE';
  updatedAt?: string;
  publishedAt?: string;
};

export async function fetchSitemapMarketItems(pageSize = 100): Promise<SitemapMarketItem[]> {
  const [vehicles, plates] = await Promise.all([
    fetchApi<{
      items?: Array<{ id: string; updatedAt?: string; publishedAt?: string }>;
    }>(`/v1/vehicles?page=1&pageSize=${pageSize}&sortBy=publishedAt&sortOrder=desc`),
    fetchApi<{
      items?: Array<{ id: string; updatedAt?: string; publishedAt?: string }>;
    }>(`/v1/plates?page=1&pageSize=${pageSize}&sortBy=publishedAt&sortOrder=desc`),
  ]);

  return [
    ...(vehicles?.items ?? []).map((item) => ({ ...item, domain: 'VEHICLE' as const })),
    ...(plates?.items ?? []).map((item) => ({ ...item, domain: 'PLATE' as const })),
  ];
}

/** @deprecated Prefer fetchSitemapMarketItems — kept for callers during migration. */
export async function fetchSitemapListings(pageSize = 100): Promise<
  Array<{ id: string; updatedAt?: string; publishedAt?: string }>
> {
  return fetchSitemapMarketItems(pageSize);
}

export async function fetchSitemapDealers(): Promise<Array<{ slug: string }>> {
  const data = await fetchApi<{ items?: Array<{ slug: string }> }>(
    '/v1/dealers?page=1&pageSize=100',
  );
  return data?.items ?? [];
}
