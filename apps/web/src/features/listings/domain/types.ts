export type ListingCategoryCode =
  | 'CAR'
  | 'PLATE'
  | 'MOTORCYCLE'
  | 'TRUCK'
  | 'HEAVY_EQUIPMENT';

export type ListingPlateModel = {
  formatCode: string;
  plateDisplay: string;
  series: string | null;
  number: string | null;
  regionCode: string | null;
  plateType: string | null;
};

export type MarketplaceDomainCode = 'VEHICLE' | 'PLATE';

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
  imageUrls: string[];
  categoryCode: ListingCategoryCode;
  /** Marketplace domain discriminator (Sprint 20). */
  domain?: MarketplaceDomainCode;
  status?: string;
  viewsCount?: number;
  favoritesCount?: number;
  plateDetails?: ListingPlateModel | null;
  dealerBadge?: boolean;
};

export type ListingMediaModel = {
  id: string;
  url: string | null;
  kind: string;
  blurDataUrl?: string | null;
  isPrimary?: boolean;
  variants?: Array<{
    kind: string;
    r2Key: string;
    mimeType: string;
    width: number | null;
    height: number | null;
  }>;
};

export type ListingSpecs = {
  brandId?: string | null;
  modelId?: string | null;
  fuelTypeId?: string | null;
  transmissionTypeId?: string | null;
  colorId?: string | null;
  bodyTypeId?: string | null;
  driveTypeId?: string | null;
  conditionTypeId?: string | null;
  doors?: number | null;
  seats?: number | null;
  engineSizeCc?: number | null;
  trim?: string | null;
  interiorColor?: string | null;
};

export type SellerContactModel = {
  displayName: string | null;
  phone: string | null;
  whatsapp: string | null;
  dealerSlug: string | null;
  dealerName: string | null;
  dealerVerified: boolean;
  dealerLogoUrl: string | null;
};

export type ReportReason =
  | 'SPAM'
  | 'FRAUD'
  | 'INAPPROPRIATE'
  | 'DUPLICATE'
  | 'WRONG_CATEGORY'
  | 'OTHER';

export type ContactChannel = 'phone' | 'whatsapp';

export type ListingDetailModel = ListingCardModel & {
  description: string;
  media: ListingMediaModel[];
  publishedAt: string | null;
  sellerId: string | null;
  specs: ListingSpecs | null;
  cityId?: string | null;
  governorateId?: string | null;
  cityNameEn?: string | null;
  latitude: number | null;
  longitude: number | null;
  locationText: string | null;
  features: string[];
  sellerContact: SellerContactModel | null;
  phoneClicks?: number | null;
  whatsappClicks?: number | null;
};

export const REPORT_REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'FRAUD', label: 'Fraud or scam' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate content' },
  { value: 'DUPLICATE', label: 'Duplicate listing' },
  { value: 'WRONG_CATEGORY', label: 'Wrong category' },
  { value: 'OTHER', label: 'Other' },
];

export type ListingStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'ACTIVE'
  | 'RESERVED'
  | 'SOLD'
  | 'ARCHIVED'
  | 'REJECTED';

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
  { id: 'REJECTED', label: 'Rejected' },
];
