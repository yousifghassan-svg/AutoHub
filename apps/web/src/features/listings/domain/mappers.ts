import { formatMoney } from '@/features/currencies/lib/format-money';
import { mediaPublicUrl } from '@/lib/media/url';
import type { ListingCardModel, ListingCategoryCode, ListingDetailModel } from './types';

export type ApiListing = {
  id: string;
  slug: string;
  sellerId?: string | null;
  status?: string;
  primaryPrice: number | null;
  primaryCurrencyId: string | null;
  currencyCode?: string | null;
  primaryCurrency?: { code?: string | null } | null;
  isFeatured: boolean;
  isVerified: boolean;
  viewsCount?: number;
  favoritesCount?: number;
  publishedAt?: string | null;
  categoryCode?: string;
  domain?: 'VEHICLE' | 'PLATE';
  thumbnailKey?: string | null;
  translations?: Array<{ language: string; title: string; description?: string }>;
  media?: Array<{
    id?: string;
    r2Key: string;
    thumbnailKey: string | null;
    sortOrder: number;
    mediaType?: string;
    blurDataUrl?: string | null;
    isPrimary?: boolean;
    variants?: Array<{
      kind: string;
      r2Key: string;
      mimeType: string;
      width: number | null;
      height: number | null;
    }>;
  }>;
  city?: { nameEn: string; nameAr: string };
  latitude?: number | null;
  longitude?: number | null;
  locationText?: string | null;
  features?: string[];
  sellerContact?: {
    displayName: string | null;
    phone: string | null;
    whatsapp: string | null;
    dealerSlug: string | null;
    dealerName: string | null;
    dealerVerified: boolean;
    dealerLogoUrl: string | null;
  } | null;
  carDetails?: {
    year: number | null;
    mileageKm: number | null;
    brandId?: string | null;
    modelId?: string | null;
    fuelTypeId?: string | null;
    transmissionTypeId?: string | null;
    colorId?: string | null;
    bodyTypeId?: string | null;
    driveTypeId?: string | null;
    doors?: number | null;
    seats?: number | null;
    engineSizeCc?: number | null;
    trim?: string | null;
    interiorColor?: string | null;
  } | null;
  motorcycleDetails?: {
    year: number | null;
    mileageKm: number | null;
    brandId?: string | null;
    modelId?: string | null;
    fuelTypeId?: string | null;
    colorId?: string | null;
  } | null;
  truckDetails?: {
    year: number | null;
    mileageKm: number | null;
    brandId?: string | null;
    modelId?: string | null;
    fuelTypeId?: string | null;
    transmissionTypeId?: string | null;
    colorId?: string | null;
  } | null;
  conditionTypeId?: string | null;
  governorateId?: string | null;
  title?: string;
  plateDetails?: {
    formatCode: string;
    plateDisplay: string;
    series?: string | null;
    number?: string | null;
    regionCode?: string | null;
    plateType?: string | null;
  } | null;
  category?: { code: string };
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
    if (code) return code.toUpperCase();
    return 'IQD';
  }
  if (!listingOrId) return 'IQD';
  if (listingOrId === 'USD' || listingOrId === 'IQD') return listingOrId;
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
    listing.title ??
    listing.slug;
  const media = [...(listing.media ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const thumb =
    media[0]?.thumbnailKey ?? media[0]?.r2Key ?? listing.thumbnailKey ?? null;
  const imageUrls = media
    .map((m) => mediaPublicUrl(m.thumbnailKey ?? m.r2Key))
    .filter((u): u is string => Boolean(u));
  if (!imageUrls.length && thumb) {
    const u = mediaPublicUrl(thumb);
    if (u) imageUrls.push(u);
  }
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
    imageUrls,
    categoryCode: (listing.categoryCode ?? listing.category?.code ?? 'CAR') as ListingCategoryCode,
    domain:
      listing.domain ??
      ((listing.categoryCode ?? listing.category?.code) === 'PLATE' ? 'PLATE' : 'VEHICLE'),
    status: listing.status,
    viewsCount: listing.viewsCount,
    favoritesCount: listing.favoritesCount,
    dealerBadge: listing.isVerified,
    plateDetails: listing.plateDetails
      ? {
          formatCode: listing.plateDetails.formatCode,
          plateDisplay: listing.plateDetails.plateDisplay,
          series: listing.plateDetails.series ?? null,
          number: listing.plateDetails.number ?? null,
          regionCode: listing.plateDetails.regionCode ?? null,
          plateType: listing.plateDetails.plateType ?? null,
        }
      : null,
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
      blurDataUrl: m.blurDataUrl ?? null,
      isPrimary: m.isPrimary ?? m.sortOrder === 0,
      variants: m.variants,
    }));

  const details =
    listing.carDetails ?? listing.motorcycleDetails ?? listing.truckDetails ?? null;

  const locationText = listing.locationText?.trim() || null;

  return {
    ...card,
    location: locationText || card.location,
    description,
    media,
    publishedAt: listing.publishedAt ?? null,
    sellerId: listing.sellerId ?? null,
    governorateId: listing.governorateId ?? null,
    cityNameEn: listing.city?.nameEn ?? null,
    latitude: listing.latitude ?? null,
    longitude: listing.longitude ?? null,
    locationText,
    features: listing.features ?? [],
    sellerContact: listing.sellerContact ?? null,
    dealerBadge: Boolean(listing.sellerContact?.dealerSlug ?? listing.isVerified),
    specs: details
      ? {
          brandId: details.brandId ?? null,
          modelId: details.modelId ?? null,
          fuelTypeId: details.fuelTypeId ?? null,
          transmissionTypeId:
            'transmissionTypeId' in details
              ? ((details as { transmissionTypeId?: string | null }).transmissionTypeId ?? null)
              : null,
          colorId: details.colorId ?? null,
          bodyTypeId: listing.carDetails?.bodyTypeId ?? null,
          driveTypeId: listing.carDetails?.driveTypeId ?? null,
          conditionTypeId: listing.conditionTypeId ?? null,
          doors: listing.carDetails?.doors ?? null,
          seats: listing.carDetails?.seats ?? null,
          engineSizeCc: listing.carDetails?.engineSizeCc ?? null,
          trim: listing.carDetails?.trim ?? null,
          interiorColor: listing.carDetails?.interiorColor ?? null,
        }
      : null,
  };
}

export function formatPrice(
  price: number | null,
  currencyCode: string,
  locale: 'ar' | 'ku' | 'en' = 'en',
): string {
  return formatMoney(price, currencyCode || 'IQD', locale);
}

export function formatMileage(km: number | null | undefined): string | null {
  if (km == null) return null;
  return `${km.toLocaleString()} km`;
}
