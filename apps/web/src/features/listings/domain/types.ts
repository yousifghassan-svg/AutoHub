export type ListingCategoryCode =
  | 'CAR'
  | 'PLATE'
  | 'MOTORCYCLE'
  | 'TRUCK'
  | 'HEAVY_EQUIPMENT';

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
  thumbnailKey: string | null;
  imageUrl: string | null;
  categoryCode: ListingCategoryCode;
  status?: string;
  viewsCount?: number;
  favoritesCount?: number;
};

export type ListingDetailModel = ListingCardModel & {
  description: string;
  media: Array<{ id: string; url: string | null; kind: string }>;
  publishedAt: string | null;
  sellerId: string | null;
};

export type ListingStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'ACTIVE'
  | 'RESERVED'
  | 'SOLD'
  | 'ARCHIVED';

export const CATEGORIES: Array<{ code: ListingCategoryCode; label: string; labelAr: string }> = [
  { code: 'CAR', label: 'Cars', labelAr: 'سيارات' },
  { code: 'PLATE', label: 'Plates', labelAr: 'لوحات' },
  { code: 'MOTORCYCLE', label: 'Motorcycles', labelAr: 'دراجات' },
  { code: 'TRUCK', label: 'Trucks', labelAr: 'شاحنات' },
  { code: 'HEAVY_EQUIPMENT', label: 'Heavy Equipment', labelAr: 'معدات ثقيلة' },
];

export const STATUS_TABS: Array<{ id: 'ALL' | ListingStatus; label: string }> = [
  { id: 'ALL', label: 'All' },
  { id: 'DRAFT', label: 'Drafts' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'ACTIVE', label: 'Active' },
  { id: 'RESERVED', label: 'Reserved' },
  { id: 'SOLD', label: 'Sold' },
  { id: 'ARCHIVED', label: 'Archived' },
];
