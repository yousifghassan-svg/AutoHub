import { mediaPublicUrl } from '@/lib/media/url';
import type { ListingCardModel, ListingCategoryCode } from './types';

type ApiListing = {
  id: string;
  slug: string;
  primaryPrice: number | null;
  primaryCurrencyId: string | null;
  currencyCode?: string | null;
  primaryCurrency?: { code?: string | null } | null;
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

const CURRENCY_FALLBACK = 'IQD';
const LOCALE_MAP: Record<string, string> = {
  ar: 'ar-IQ',
  ku: 'ckb-IQ',
  en: 'en-IQ',
};

export function resolveCurrencyCode(
  listingOrId:
    | string
    | null
    | undefined
    | {
        currencyCode?: string | null;
        primaryCurrency?: { code?: string | null } | null;
        primaryCurrencyId?: string | null;
      },
): string {
  if (listingOrId && typeof listingOrId === 'object') {
    const code =
      listingOrId.currencyCode ??
      listingOrId.primaryCurrency?.code ??
      (listingOrId.primaryCurrencyId === 'USD' || listingOrId.primaryCurrencyId === 'IQD'
        ? listingOrId.primaryCurrencyId
        : null);
    return (code ?? CURRENCY_FALLBACK).toUpperCase();
  }
  if (!listingOrId) return CURRENCY_FALLBACK;
  if (listingOrId === 'USD' || listingOrId === 'IQD') return listingOrId;
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
    currencyCode: resolveCurrencyCode(listing),
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

export function formatPrice(
  price: number | null,
  currencyCode: string,
  locale: 'ar' | 'ku' | 'en' = 'en',
): string {
  if (price == null) return '—';
  const code = currencyCode || 'IQD';
  const fraction = code === 'IQD' ? 0 : 2;
  const bcp47 = LOCALE_MAP[locale] ?? locale;
  try {
    return new Intl.NumberFormat(bcp47, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: fraction,
      maximumFractionDigits: fraction,
    }).format(price);
  } catch {
    return `${code} ${price.toLocaleString(bcp47)}`;
  }
}

export function formatMileage(km: number | null): string | null {
  if (km == null) return null;
  return `${km.toLocaleString()} km`;
}
