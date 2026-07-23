export type ListingCategoryCode =
  | 'CAR'
  | 'PLATE'
  | 'MOTORCYCLE'
  | 'TRUCK'
  | 'HEAVY_EQUIPMENT'
  | 'PARTS'
  | 'RENTAL';

/** Flattened card model for UI (no screen mapping logic). */
export type ListingCardModel = {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  currencyCode: string;
  location: string;
  mileageKm: number | null;
  year: number | null;
  isVerified: boolean;
  isFeatured: boolean;
  imageUrl: string | null;
  thumbnailKey: string | null;
  categoryCode: ListingCategoryCode | string;
};

export type ListingsPage = {
  items: ListingCardModel[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CategoryItem = {
  id: string;
  code: ListingCategoryCode | string;
  slug: string;
  nameEn: string;
  nameAr: string;
  searchCount?: number;
};

export type TrendingData = {
  windowDays: number;
  categories: CategoryItem[];
  brands: Array<{
    id: string;
    nameEn: string;
    nameAr: string;
    slug: string;
    category: string;
    searchCount: number;
  }>;
  models: Array<{
    id: string;
    nameEn: string;
    nameAr: string;
    slug: string;
    brandId: string;
    searchCount: number;
  }>;
};

export type RecentSearchItem = {
  id: string;
  keyword: string | null;
  categoryId: string | null;
  brandId: string | null;
  modelId: string | null;
  cityId: string | null;
  resultCount: number;
  createdAt: string;
};

export type ListingsQuery = {
  page?: number;
  pageSize?: number;
  isFeatured?: boolean;
  categoryCode?: string;
  keyword?: string;
  sortBy?: 'createdAt' | 'primaryPrice' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
};
