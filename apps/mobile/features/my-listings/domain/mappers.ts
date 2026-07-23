import { mediaPublicUrl } from '@/lib/media/url';
import { resolveCurrencyCode } from '@/features/home/domain/mappers';
import type { ListingStatus, ManagedListing, ListingStats } from './types';

type ApiListing = {
  id: string;
  slug: string;
  status: string;
  categoryId: string;
  categoryCode: string;
  cityId: string;
  primaryPrice: number | null;
  primaryCurrencyId: string | null;
  isFeatured: boolean;
  isVerified: boolean;
  viewsCount: number;
  favoritesCount: number;
  publishedAt: string | null;
  soldAt: string | null;
  updatedAt: string;
  translations?: Array<{ language: string; title: string; description: string }>;
  media?: Array<{ r2Key: string; thumbnailKey: string | null; sortOrder: number }>;
  city?: { nameEn: string; nameAr: string };
};

export function mapManagedListing(
  listing: ApiListing,
  locale: 'ar' | 'ku' | 'en' = 'ar',
): ManagedListing {
  const translations = listing.translations ?? [];
  const title =
    translations.find((t) => t.language === locale)?.title ??
    translations[0]?.title ??
    listing.slug;
  const description =
    translations.find((t) => t.language === locale)?.description ??
    translations[0]?.description ??
    '';

  const media = [...(listing.media ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)[0];
  const key = media?.thumbnailKey ?? media?.r2Key ?? null;

  const stats: ListingStats = {
    views: listing.viewsCount ?? 0,
    favorites: listing.favoritesCount ?? 0,
    phoneClicks: null,
    whatsappClicks: null,
    shares: null,
  };

  return {
    id: listing.id,
    slug: listing.slug,
    title,
    description,
    status: listing.status as ListingStatus,
    price: listing.primaryPrice,
    currencyCode: resolveCurrencyCode(listing.primaryCurrencyId),
    location:
      locale === 'en'
        ? (listing.city?.nameEn ?? '')
        : (listing.city?.nameAr ?? listing.city?.nameEn ?? ''),
    imageUrl: mediaPublicUrl(key),
    categoryCode: listing.categoryCode,
    categoryId: listing.categoryId,
    cityId: listing.cityId,
    primaryCurrencyId: listing.primaryCurrencyId,
    isFeatured: listing.isFeatured,
    isVerified: listing.isVerified,
    publishedAt: listing.publishedAt,
    soldAt: listing.soldAt,
    updatedAt: listing.updatedAt,
    stats,
  };
}
