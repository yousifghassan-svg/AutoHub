import { mediaPublicUrl } from '@/lib/media/url';
import type { ListingCardModel, ListingCategoryCode, ListingDetailModel } from './types';

export type ApiListing = {
  id: string;
  slug: string;
  sellerId?: string | null;
  status?: string;
  primaryPrice: number | null;
  primaryCurrencyId: string | null;
  isFeatured: boolean;
  isVerified: boolean;
  viewsCount?: number;
  favoritesCount?: number;
  publishedAt?: string | null;
  categoryCode?: string;
  translations?: Array<{ language: string; title: string; description?: string }>;
  media?: Array<{
    id?: string;
    r2Key: string;
    thumbnailKey: string | null;
    sortOrder: number;
    mediaType?: string;
  }>;
  city?: { nameEn: string; nameAr: string };
  carDetails?: { year: number | null; mileageKm: number | null } | null;
  motorcycleDetails?: { year: number | null; mileageKm: number | null } | null;
  truckDetails?: { year: number | null; mileageKm: number | null } | null;
  category?: { code: string };
};

export function resolveCurrencyCode(currencyId: string | null | undefined): string {
  if (!currencyId) return 'IQD';
  if (currencyId === 'USD' || currencyId === 'IQD') return currencyId;
  return 'IQD';
}

export function mapListingToCard(
  listing: ApiListing,
  locale: 'ar' | 'en' = 'ar',
): ListingCardModel {
  const translations = listing.translations ?? [];
  const title =
    translations.find((t) => t.language === locale)?.title ??
    translations[0]?.title ??
    listing.slug;
  const media = [...(listing.media ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const thumb = media[0]?.thumbnailKey ?? media[0]?.r2Key ?? null;
  const details =
    listing.carDetails ?? listing.motorcycleDetails ?? listing.truckDetails ?? null;
  const location =
    locale === 'en'
      ? (listing.city?.nameEn ?? '')
      : (listing.city?.nameAr ?? listing.city?.nameEn ?? '');

  return {
    id: listing.id,
    slug: listing.slug,
    title,
    price: listing.primaryPrice,
    currencyCode: resolveCurrencyCode(listing.primaryCurrencyId),
    location,
    mileageKm: details?.mileageKm ?? null,
    year: details?.year ?? null,
    isVerified: listing.isVerified,
    isFeatured: listing.isFeatured,
    thumbnailKey: thumb,
    imageUrl: mediaPublicUrl(thumb),
    categoryCode: (listing.categoryCode ?? listing.category?.code ?? 'CAR') as ListingCategoryCode,
    status: listing.status,
    viewsCount: listing.viewsCount,
    favoritesCount: listing.favoritesCount,
  };
}

export function mapListingToDetail(listing: ApiListing): ListingDetailModel {
  const card = mapListingToCard(listing);
  const translations = listing.translations ?? [];
  const description =
    translations.find((t) => t.language === 'ar')?.description ??
    translations[0]?.description ??
    '';
  const media = [...(listing.media ?? [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m) => ({
      id: m.id ?? m.r2Key,
      url: mediaPublicUrl(m.r2Key) ?? mediaPublicUrl(m.thumbnailKey),
      kind: m.mediaType ?? 'IMAGE',
    }));

  return {
    ...card,
    description,
    media,
    publishedAt: listing.publishedAt ?? null,
    sellerId: listing.sellerId ?? null,
  };
}

export function formatPrice(price: number | null, currencyCode: string): string {
  if (price == null) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode === 'IQD' ? 'IQD' : currencyCode,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${price.toLocaleString()} ${currencyCode}`;
  }
}

export function formatMileage(km: number | null | undefined): string | null {
  if (km == null) return null;
  return `${km.toLocaleString()} km`;
}
