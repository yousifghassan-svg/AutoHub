import { mediaPublicUrl } from '@/lib/media/url';
import { resolveCurrencyCode } from '@/features/home/domain/mappers';
import type { ManageStatus, ManagedItem } from './types';

type ApiListing = {
  id: string;
  slug: string;
  status: string;
  categoryId: string;
  cityId: string;
  primaryPrice: number | null;
  primaryCurrencyId: string | null;
  publishedAt: string | null;
  expiresAt?: string | null;
  updatedAt: string;
  translations?: Array<{ language: string; title: string; description: string }>;
  media?: Array<{ r2Key: string; thumbnailKey: string | null; sortOrder: number }>;
  city?: { nameEn: string; nameAr: string };
};

export function mapManagedItem(
  listing: ApiListing,
  domain: 'VEHICLE' | 'PLATE',
  locale: 'ar' | 'ku' | 'en' = 'ar',
): ManagedItem {
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

  let status = listing.status as ManageStatus;
  if (
    status === 'ACTIVE' &&
    listing.expiresAt &&
    new Date(listing.expiresAt).getTime() < Date.now()
  ) {
    status = 'EXPIRED';
  }

  return {
    id: listing.id,
    slug: listing.slug,
    title,
    description,
    status,
    price: listing.primaryPrice,
    currencyCode: resolveCurrencyCode(listing as never),
    location:
      locale === 'en'
        ? (listing.city?.nameEn ?? '')
        : (listing.city?.nameAr ?? listing.city?.nameEn ?? ''),
    imageUrl: mediaPublicUrl(key),
    categoryId: listing.categoryId,
    cityId: listing.cityId,
    primaryCurrencyId: listing.primaryCurrencyId,
    expiresAt: listing.expiresAt ?? null,
    publishedAt: listing.publishedAt,
    updatedAt: listing.updatedAt,
    domain,
  };
}
