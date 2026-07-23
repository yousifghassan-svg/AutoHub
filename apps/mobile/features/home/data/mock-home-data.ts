import type {
  CategoryItem,
  ListingCardModel,
  ListingsPage,
  RecentSearchItem,
  TrendingData,
} from '../domain/types';

export const MOCK_CATEGORIES: CategoryItem[] = [
  { id: 'cat-car', code: 'CAR', slug: 'cars', nameEn: 'Cars', nameAr: 'سيارات' },
  { id: 'cat-plate', code: 'PLATE', slug: 'plates', nameEn: 'Plates', nameAr: 'أرقام' },
  {
    id: 'cat-moto',
    code: 'MOTORCYCLE',
    slug: 'motorcycles',
    nameEn: 'Motorcycles',
    nameAr: 'دراجات',
  },
  { id: 'cat-truck', code: 'TRUCK', slug: 'trucks', nameEn: 'Trucks', nameAr: 'شاحنات' },
  {
    id: 'cat-heavy',
    code: 'HEAVY_EQUIPMENT',
    slug: 'heavy-equipment',
    nameEn: 'Heavy equipment',
    nameAr: 'معدات ثقيلة',
  },
];

function card(
  partial: Omit<ListingCardModel, 'currencyCode' | 'imageUrl' | 'thumbnailKey'> & {
    currencyCode?: string;
  },
): ListingCardModel {
  return {
    currencyCode: 'IQD',
    thumbnailKey: null,
    imageUrl: null,
    ...partial,
  };
}

export const MOCK_LISTINGS: ListingCardModel[] = [
  card({
    id: 'lst-1',
    slug: 'toyota-camry-2019',
    title: 'تويوتا كامري 2019',
    price: 18_500_000,
    location: 'بغداد',
    mileageKm: 45_000,
    year: 2019,
    isVerified: true,
    isFeatured: true,
    categoryCode: 'CAR',
  }),
  card({
    id: 'lst-2',
    slug: 'kia-sportage-2021',
    title: 'كيا سبورتاج 2021',
    price: 22_000_000,
    location: 'أربيل',
    mileageKm: 28_000,
    year: 2021,
    isVerified: true,
    isFeatured: true,
    categoryCode: 'CAR',
  }),
  card({
    id: 'lst-3',
    slug: 'plate-baghdad-123',
    title: 'لوحة بغداد مميزة',
    price: 5_000_000,
    location: 'بغداد',
    mileageKm: null,
    year: null,
    isVerified: false,
    isFeatured: false,
    categoryCode: 'PLATE',
  }),
  card({
    id: 'lst-4',
    slug: 'honda-civic-2018',
    title: 'هوندا سيفيك 2018',
    price: 14_200_000,
    location: 'البصرة',
    mileageKm: 72_000,
    year: 2018,
    isVerified: false,
    isFeatured: false,
    categoryCode: 'CAR',
  }),
  card({
    id: 'lst-5',
    slug: 'isuzu-npr-2016',
    title: 'إيسوزو NPR 2016',
    price: 31_000_000,
    location: 'نينوى',
    mileageKm: 120_000,
    year: 2016,
    isVerified: true,
    isFeatured: false,
    categoryCode: 'TRUCK',
  }),
  card({
    id: 'lst-6',
    slug: 'yamaha-r3-2020',
    title: 'ياماها R3 2020',
    price: 4_800_000,
    location: 'السليمانية',
    mileageKm: 9_500,
    year: 2020,
    isVerified: false,
    isFeatured: true,
    categoryCode: 'MOTORCYCLE',
  }),
];

export const MOCK_TRENDING: TrendingData = {
  windowDays: 7,
  categories: MOCK_CATEGORIES.map((c, i) => ({ ...c, searchCount: 100 - i * 10 })),
  brands: [
    {
      id: 'b1',
      nameEn: 'Toyota',
      nameAr: 'تويوتا',
      slug: 'toyota',
      category: 'CAR',
      searchCount: 42,
    },
  ],
  models: [],
};

export const MOCK_RECENT_SEARCHES: RecentSearchItem[] = [
  {
    id: 'rs1',
    keyword: 'كامري',
    categoryId: null,
    brandId: null,
    modelId: null,
    cityId: null,
    resultCount: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rs2',
    keyword: 'بغداد',
    categoryId: 'cat-car',
    brandId: null,
    modelId: null,
    cityId: null,
    resultCount: 40,
    createdAt: new Date().toISOString(),
  },
];

export function paginateMock(
  items: ListingCardModel[],
  page: number,
  pageSize: number,
): ListingsPage {
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  const total = items.length;
  return {
    items: slice,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
