import type { MetadataRoute } from 'next';
import { fetchSitemapDealers, fetchSitemapListings } from '@/lib/seo/fetch';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/search',
    '/dealers',
    '/plates',
    '/sell',
    '/favorites',
    '/login',
    '/register',
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' || path === '/search' ? 'hourly' : 'daily',
    priority: path === '' ? 1 : 0.7,
  }));

  const [listings, dealers] = await Promise.all([
    fetchSitemapListings(100),
    fetchSitemapDealers(),
  ]);

  const listingRoutes: MetadataRoute.Sitemap = listings.map((item) => ({
    url: `${siteUrl}/listings/${item.id}`,
    lastModified: item.updatedAt
      ? new Date(item.updatedAt)
      : item.publishedAt
        ? new Date(item.publishedAt)
        : new Date(),
    changeFrequency: 'daily',
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
