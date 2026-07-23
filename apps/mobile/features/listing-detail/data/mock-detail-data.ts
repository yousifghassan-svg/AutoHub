import type { ListingDetailModel, SimilarListing } from '../domain/types';
import { MOCK_LISTINGS } from '@/features/home/data/mock-home-data';

export const MOCK_DETAILS: Record<string, ListingDetailModel> = {
  'lst-1': {
    id: 'lst-1',
    slug: 'toyota-camry-2019',
    title: 'تويوتا كامري 2019',
    description:
      'سيارة بحالة ممتازة، صيانة دورية عند الوكيل. بدون حوادث. جاهزة للفحص والنقل داخل العراق.',
    price: 18_500_000,
    currencyCode: 'IQD',
    secondaryPrice: 14_000,
    secondaryCurrencyCode: 'USD',
    locationLabel: 'بغداد · الكرخ',
    cityName: 'بغداد',
    governorateName: 'بغداد',
    categoryCode: 'CAR',
    categoryName: 'سيارات',
    isFeatured: true,
    isVerified: true,
    viewsCount: 1280,
    favoritesCount: 42,
    publishedAt: new Date().toISOString(),
    media: [
      {
        id: 'm1',
        kind: 'IMAGE',
        r2Key: 'mock/camry-1.jpg',
        thumbnailKey: 'mock/camry-1.thumb.jpg',
        url: null,
        thumbUrl: null,
        mimeType: 'image/jpeg',
        sortOrder: 0,
      },
      {
        id: 'm2',
        kind: 'IMAGE',
        r2Key: 'mock/camry-2.jpg',
        thumbnailKey: null,
        url: null,
        thumbUrl: null,
        mimeType: 'image/jpeg',
        sortOrder: 1,
      },
      {
        id: 'm3',
        kind: 'VIDEO',
        r2Key: 'mock/camry.mp4',
        thumbnailKey: 'mock/camry-1.thumb.jpg',
        url: null,
        thumbUrl: null,
        mimeType: 'video/mp4',
        sortOrder: 2,
      },
      {
        id: 'm4',
        kind: '360_MEDIA',
        r2Key: 'mock/camry-360',
        thumbnailKey: null,
        url: null,
        thumbUrl: null,
        mimeType: null,
        sortOrder: 3,
      },
    ],
    specs: [
      { key: 'year', label: 'السنة', value: '2019' },
      { key: 'mileage', label: 'المسافة', value: '45,000 km' },
      { key: 'brand', label: 'الماركة', value: 'Toyota' },
      { key: 'model', label: 'الموديل', value: 'Camry' },
      { key: 'engine', label: 'المحرك (سي سي)', value: '2500' },
      { key: 'doors', label: 'الأبواب', value: '4' },
      { key: 'category', label: 'الفئة', value: 'سيارات' },
    ],
    seller: {
      id: 'seller-1',
      displayName: 'أحمد الكاظمي',
      phone: '+9647900000001',
      verified: true,
      bio: 'بائع أفراد · بغداد',
    },
    similarQuery: { categoryCode: 'CAR', cityId: 'city-bg', brandId: 'toyota' },
  },
};

function buildFallbackDetail(input: {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  currencyCode: string;
  location: string;
  categoryCode: string;
  isFeatured: boolean;
  isVerified: boolean;
  imageUrl?: string | null;
  year?: number | null;
  mileageKm?: number | null;
  viewsCount?: number;
  favoritesCount?: number;
}): ListingDetailModel {
  return {
    id: input.id,
    slug: input.slug,
    title: input.title,
    description: 'وصف تجريبي للإعلان. التفاصيل الكاملة تأتي من واجهة البرمجة.',
    price: input.price,
    currencyCode: input.currencyCode,
    secondaryPrice: null,
    secondaryCurrencyCode: null,
    locationLabel: input.location,
    cityName: input.location,
    governorateName: null,
    categoryCode: input.categoryCode,
    categoryName: input.categoryCode,
    isFeatured: input.isFeatured,
    isVerified: input.isVerified,
    viewsCount: input.viewsCount ?? 120,
    favoritesCount: input.favoritesCount ?? 5,
    publishedAt: new Date().toISOString(),
    media: [
      {
        id: `${input.id}-img`,
        kind: 'IMAGE',
        r2Key: 'mock/placeholder.jpg',
        thumbnailKey: null,
        url: input.imageUrl ?? null,
        thumbUrl: input.imageUrl ?? null,
        mimeType: 'image/jpeg',
        sortOrder: 0,
      },
    ],
    specs: [
      ...(input.year != null ? [{ key: 'year', label: 'السنة', value: String(input.year) }] : []),
      ...(input.mileageKm != null
        ? [{ key: 'mileage', label: 'المسافة', value: `${input.mileageKm.toLocaleString()} km` }]
        : []),
      { key: 'category', label: 'الفئة', value: input.categoryCode },
    ],
    seller: {
      id: 'seller-mock',
      displayName: 'بائع تجريبي',
      phone: '+9647700000000',
      verified: input.isVerified,
      bio: null,
    },
    similarQuery: { categoryCode: input.categoryCode },
  };
}

/** Fallback detail built from home mock cards / my-listings ids */
export function mockDetailFromCard(id: string): ListingDetailModel | null {
  if (MOCK_DETAILS[id]) return MOCK_DETAILS[id];
  const card = MOCK_LISTINGS.find((x) => x.id === id);
  if (card) {
    return buildFallbackDetail({
      id: card.id,
      slug: card.slug,
      title: card.title,
      price: card.price,
      currencyCode: card.currencyCode,
      location: card.location,
      categoryCode: String(card.categoryCode),
      isFeatured: card.isFeatured,
      isVerified: card.isVerified,
      imageUrl: card.imageUrl,
      year: card.year,
      mileageKm: card.mileageKm,
    });
  }
  // Synthesize detail for My Listings / sell mock ids
  if (id.startsWith('mine-') || id.startsWith('mock-listing-') || id.startsWith('mine-copy-')) {
    return buildFallbackDetail({
      id,
      slug: id,
      title: 'إعلان تجريبي',
      price: 1_000_000,
      currencyCode: 'IQD',
      location: 'بغداد',
      categoryCode: 'CAR',
      isFeatured: false,
      isVerified: false,
      viewsCount: 10,
      favoritesCount: 1,
    });
  }
  return null;
}

export function mockSimilar(excludeId: string): SimilarListing[] {
  return MOCK_LISTINGS.filter((x) => x.id !== excludeId)
    .slice(0, 6)
    .map((c) => ({
      id: c.id,
      title: c.title,
      price: c.price,
      currencyCode: c.currencyCode,
      location: c.location,
      imageUrl: c.imageUrl,
      year: c.year,
      isVerified: c.isVerified,
      isFeatured: c.isFeatured,
    }));
}
