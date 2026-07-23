import { mediaPublicUrl } from '@/lib/media/url';
import type { ListingCardModel, ListingCategoryCode } from './types';

type ApiListing = {
  id: string;
  slug: string;
  primaryPrice: number | null;
  primaryCurrencyId: string | null;
  isFeatured: boolean;
  isVerified: boolean;
  categoryCode?: string;
  translations?: Array<{ language: string; title: string }>;
  media?: Array<{ r2Key: string; thumbnailKey: string | null; sortOrder: number }>;
  city?: { nameEn: string; nameAr: string };
  carDetails?: { year: number | null; mileageKm: number | null } | null;
  motorcycleDetails?: { year: number | null; mileageKm: number | null } | null;
  truckDetails?: { year: number | null; mileageKm: number | null } | null;
  category?: { code: string };
};

/** Known seeded currency IDs are opaque UUIDs — map common codes when env provides them. */
const CURRENCY_FALLBACK = 'IQD';

export function resolveCurrencyCode(currencyId: string | null | undefined): string {
  if (!currencyId) return CURRENCY_FALLBACK;
  // Prefer showing IQD/USD when id looks like a code (tests/mocks); otherwise default IQD.
  if (currencyId === 'USD' || currencyId === 'IQD') return currencyId;
  return CURRENCY_FALLBACK;
}

export function mapListingToCard(
  listing: ApiListing,
  locale: 'ar' | 'ku' | 'en' = 'ar',
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
  };
}

export function formatPrice(price: number | null, currencyCode: string): string {
  if (price == null) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode === 'IQD' ? 'IQD' : currencyCode,
      maximumFractionDigits: currencyCode === 'IQD' ? 0 : 0,
    }).format(price);
  } catch {
    return `${price.toLocaleString()} ${currencyCode}`;
  }
}

export function formatMileage(km: number | null): string | null {
  if (km == null) return null;
  return `${km.toLocaleString()} km`;
}
