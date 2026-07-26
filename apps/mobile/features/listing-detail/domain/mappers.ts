import { mediaPublicUrl } from '@/lib/media/url';
import { resolveCurrencyCode } from '@/features/home/domain/mappers';
import type {
  ListingDetailModel,
  ListingMediaItem,
  ListingMediaKind,
  SimilarListing,
  SpecRow,
} from './types';

type ApiMedia = {
  id: string;
  r2Key: string;
  thumbnailKey: string | null;
  mediaType: string;
  mimeType: string | null;
  sortOrder: number;
};

type ApiListingDetail = {
  id: string;
  sellerId: string | null;
  slug: string;
  categoryCode: string;
  primaryPrice: number | null;
  primaryCurrencyId: string | null;
  secondaryPrice: number | null;
  secondaryCurrencyId: string | null;
  isFeatured: boolean;
  isVerified: boolean;
  viewsCount: number;
  favoritesCount: number;
  publishedAt: string | null;
  cityId: string;
  translations?: Array<{ language: string; title: string; description: string }>;
  media?: ApiMedia[];
  category?: { code: string; nameEn: string; nameAr: string };
  city?: {
    id: string;
    nameEn: string;
    nameAr: string;
    governorateId?: string;
    governorate?: { nameEn: string; nameAr: string };
  };
  carDetails?: Record<string, unknown> | null;
  motorcycleDetails?: Record<string, unknown> | null;
  truckDetails?: Record<string, unknown> | null;
  heavyEquipmentDetails?: Record<string, unknown> | null;
  plateDetails?: Record<string, unknown> | null;
};

function mapMediaKind(raw: string): ListingMediaKind {
  if (raw === 'VIDEO') return 'VIDEO';
  if (raw === '360_MEDIA' || raw === 'MEDIA_360') return '360_MEDIA';
  return 'IMAGE';
}

export function mapApiMedia(items: ApiMedia[] | undefined): ListingMediaItem[] {
  return [...(items ?? [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m) => {
      const thumbKey = m.thumbnailKey ?? m.r2Key;
      return {
        id: m.id,
        kind: mapMediaKind(m.mediaType),
        r2Key: m.r2Key,
        thumbnailKey: m.thumbnailKey,
        mimeType: m.mimeType,
        sortOrder: m.sortOrder,
        url: mediaPublicUrl(m.r2Key),
        thumbUrl: mediaPublicUrl(thumbKey),
      };
    });
}

function pickText(
  translations: ApiListingDetail['translations'],
  field: 'title' | 'description',
  locale: string,
  fallback: string,
): string {
  const list = translations ?? [];
  return (
    list.find((t) => t.language === locale)?.[field] ??
    list[0]?.[field] ??
    fallback
  );
}

function cityName(city: ApiListingDetail['city'], locale: string): string {
  if (!city) return '';
  return locale === 'en' ? city.nameEn : city.nameAr || city.nameEn;
}

function govName(city: ApiListingDetail['city'], locale: string): string | null {
  const g = city?.governorate;
  if (!g) return null;
  return locale === 'en' ? g.nameEn : g.nameAr || g.nameEn;
}

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null;
}

function buildSpecs(listing: ApiListingDetail, locale: string): SpecRow[] {
  const rows: SpecRow[] = [];
  const push = (key: string, label: string, value: string | number | null | undefined) => {
    if (value == null || value === '') return;
    rows.push({ key, label, value: String(value) });
  };

  const labels =
    locale === 'en'
      ? {
          year: 'Year',
          mileage: 'Mileage',
          brand: 'Brand',
          model: 'Model',
          engine: 'Engine (cc)',
          doors: 'Doors',
          category: 'Category',
          plate: 'Plate',
        }
      : {
          year: 'السنة',
          mileage: 'المسافة',
          brand: 'الماركة',
          model: 'الموديل',
          engine: 'المحرك (سي سي)',
          doors: 'الأبواب',
          category: 'الفئة',
          plate: 'اللوحة',
        };

  const vehicle =
    listing.carDetails ??
    listing.motorcycleDetails ??
    listing.truckDetails ??
    listing.heavyEquipmentDetails ??
    null;

  if (vehicle) {
    push('year', labels.year, num(vehicle.year));
    const km = num(vehicle.mileageKm);
    if (km != null) push('mileage', labels.mileage, `${km.toLocaleString()} km`);
    push('brand', labels.brand, str(vehicle.brandId));
    push('model', labels.model, str(vehicle.modelId));
    push('engine', labels.engine, num(vehicle.engineSizeCc));
    push('doors', labels.doors, num(vehicle.doors));
  }

  if (listing.plateDetails) {
    push('plate', labels.plate, str(listing.plateDetails.plateNumber) ?? str(listing.plateDetails.number));
  }

  const catName =
    locale === 'en'
      ? listing.category?.nameEn
      : listing.category?.nameAr ?? listing.category?.nameEn;
  push('category', labels.category, catName ?? listing.categoryCode);

  return rows;
}

export function mapListingDetail(
  listing: ApiListingDetail,
  locale: 'ar' | 'ku' | 'en' = 'ar',
  sellerPhone: string | null = null,
): ListingDetailModel {
  const title = pickText(listing.translations, 'title', locale, listing.slug);
  const description = pickText(listing.translations, 'description', locale, '');
  const city = cityName(listing.city, locale);
  const governorate = govName(listing.city, locale);
  const locationLabel = [city, governorate].filter(Boolean).join(' · ');

  const brandId =
    (listing.carDetails?.brandId as string | undefined) ??
    (listing.motorcycleDetails?.brandId as string | undefined) ??
    undefined;

  return {
    id: listing.id,
    slug: listing.slug,
    title,
    description,
    price: listing.primaryPrice,
    currencyCode: resolveCurrencyCode(listing as never),
       secondaryPrice: listing.secondaryPrice,
    secondaryCurrencyCode: listing.secondaryCurrencyId
      ? resolveCurrencyCode(listing.secondaryCurrencyId)
      : null,
    locationLabel,
    cityName: city,
    governorateName: governorate,
    categoryCode: listing.categoryCode,
    categoryName:
      (locale === 'en' ? listing.category?.nameEn : listing.category?.nameAr) ??
      listing.categoryCode,
    isFeatured: listing.isFeatured,
    isVerified: listing.isVerified,
    viewsCount: listing.viewsCount,
    favoritesCount: listing.favoritesCount,
    publishedAt: listing.publishedAt,
    media: mapApiMedia(listing.media),
    specs: buildSpecs(listing, locale),
    seller: {
      id: listing.sellerId ?? 'unknown',
      displayName: locale === 'en' ? 'Seller' : 'البائع',
      phone: sellerPhone,
      verified: listing.isVerified,
      bio: null,
    },
    similarQuery: {
      categoryCode: listing.categoryCode,
      cityId: listing.cityId,
      brandId,
    },
  };
}

export function mapSimilarFromListItem(
  item: {
    id: string;
    slug: string;
    primaryPrice: number | null;
    primaryCurrencyId: string | null;
    isFeatured: boolean;
    isVerified: boolean;
    translations?: Array<{ language: string; title: string }>;
    media?: Array<{ r2Key: string; thumbnailKey: string | null; sortOrder: number }>;
    city?: { nameEn: string; nameAr: string };
    carDetails?: { year: number | null } | null;
  },
  locale: 'ar' | 'ku' | 'en' = 'ar',
): SimilarListing {
  const title =
    item.translations?.find((t) => t.language === locale)?.title ??
    item.translations?.[0]?.title ??
    item.slug;
  const media = [...(item.media ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)[0];
  const key = media?.thumbnailKey ?? media?.r2Key ?? null;
  return {
    id: item.id,
    title,
    price: item.primaryPrice,
    currencyCode: resolveCurrencyCode(item as never),
    location: locale === 'en' ? (item.city?.nameEn ?? '') : (item.city?.nameAr ?? item.city?.nameEn ?? ''),
    imageUrl: mediaPublicUrl(key),
    year: item.carDetails?.year ?? null,
    isVerified: item.isVerified,
    isFeatured: item.isFeatured,
  };
}
