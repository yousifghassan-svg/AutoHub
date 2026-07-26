import type { MetadataRoute } from 'next';
import { fetchSitemapDealers, fetchSitemapMarketItems } from '@/lib/seo/fetch';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/vehicles',
    '/vehicles/search',
    '/dealers',
    '/plates',
    '/plates/search',
    '/sell',
    '/favorites',
    '/login',
    '/register',
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'hourly' : 'daily',
    priority: path === '' ? 1 : 0.7,
  }));

  const [marketItems, dealers] = await Promise.all([
    fetchSitemapMarketItems(100),
    fetchSitemapDealers(),
  ]);

  const listingRoutes: MetadataRoute.Sitemap = marketItems.map((item) => ({
    url: `${siteUrl}/${item.domain === 'PLATE' ? 'plates' : 'vehicles'}/${item.id}`,
    lastModified: item.updatedAt
      ? new Date(item.updatedAt)
      : item.publishedAt
        ? new Date(item.publishedAt)
        : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const dealerRoutes: MetadataRoute.Sitemap = dealers.map((d) => ({
    url: `${siteUrl}/dealers/${d.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.75,
  }));

  return [...staticRoutes, ...listingRoutes, ...dealerRoutes];
}
