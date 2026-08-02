export type ApiMeta = {
  requestId: string;
  timestamp: string;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta: ApiMeta;
};

export type ApiErrorBody = {
  success: false;
  error: {
    statusCode: number;
    message: string | string[];
    code?: string;
    details?: unknown;
  };
  meta: ApiMeta;
};

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(params: {
    message: string;
    statusCode: number;
    code?: string;
    details?: unknown;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.details = params.details;
  }
}

export type AuthenticatedUser = {
  id: string;
  firebaseUid: string | null;
  phone: string | null;
  email: string | null;
  displayName: string | null;
  role: string;
  permissions: string[];
  status: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthenticatedUser;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginationQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
};

export type ListingStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'ACTIVE'
  | 'RESERVED'
  | 'SOLD'
  | 'ARCHIVED'
  | 'REJECTED';

export type UserRole =
  | 'USER'
  | 'DEALER'
  | 'MODERATOR'
  | 'DEALER_MANAGER'
  | 'SUPPORT'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export type ReportStatus = 'OPEN' | 'RESOLVED' | 'REJECTED';

export type ReportReason =
  | 'SPAM'
  | 'FRAUD'
  | 'INAPPROPRIATE'
  | 'DUPLICATE'
  | 'WRONG_CATEGORY'
  | 'OTHER';

export type DashboardCurrencyStats = {
  vehiclesByCurrency: Array<{ currencyCode: string; count: number }>;
  platesByCurrency: Array<{ currencyCode: string; count: number }>;
  averagePriceByCurrency: Array<{
    currencyCode: string;
    averagePrice: number | null;
    pricedListings: number;
  }>;
};

export type DashboardSummary = {
  totalUsers: number;
  totalDealers: number;
  totalCars: number;
  totalPlates: number;
  activeListings: number;
  soldListings: number;
  pendingListings: number;
  archivedListings: number;
  todaysListings: number;
  thisMonthListings: number;
  totalViews: number;
  totalFavorites: number;
  currency?: DashboardCurrencyStats;
};

export type StatsRange = 'daily' | 'weekly' | 'monthly';

export type StatsOverview = {
  range: StatsRange;
  since: string;
  listingsCreated: number;
  usersCreated: number;
  searchEvents: number;
  sold: number;
  topBrands: { brandId: string | null; nameEn: string; count: number }[];
  topCities: { cityId: string; nameEn: string; nameAr: string; count: number }[];
  topSearched: { keyword: string; count: number }[];
  topDealers: {
    id: string;
    name: string;
    slug: string;
    verified: boolean;
    followers: number;
    views: number;
    cars: number;
  }[];
};

export type AdminListingMedia = {
  id: string;
  r2Key: string;
  thumbnailKey?: string | null;
  mediaType: string;
  sortOrder: number;
  mediaAssetId?: string | null;
};

export type AdminListing = {
  id: string;
  /** Present when API flattens; otherwise use translations / metaTitle. */
  title?: string | null;
  description?: string | null;
  metaTitle?: string | null;
  status: ListingStatus;
  categoryId?: string | null;
  categoryCode?: string | null;
  cityId?: string | null;
  sellerId?: string | null;
  conditionTypeId?: string | null;
  primaryPrice: number | null;
  secondaryPrice: number | null;
  currencyCode?: string | null;
  primaryCurrencyId?: string | null;
  primaryCurrency?: { id: string; code: string; symbol?: string; decimalPlaces?: number } | null;
  isFeatured: boolean;
  isVerified: boolean;
  slug: string;
  viewsCount?: number;
  favoritesCount?: number;
  viewCount?: number;
  favoriteCount?: number;
  locationText?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  translations?: Array<{ language: string; title: string; description: string }>;
  media?: AdminListingMedia[];
  category?: { id: string; code: string; nameEn: string; nameAr: string } | null;
  city?: {
    id: string;
    nameEn: string;
    nameAr: string;
    governorateId?: string;
    governorate?: { id: string; nameEn: string; code?: string } | null;
  } | null;
  seller?: {
    id: string;
    displayName: string | null;
    phone: string | null;
    email: string | null;
    role: string;
  } | null;
  carDetails?: {
    brandId?: string | null;
    modelId?: string | null;
    year?: number | null;
    mileageKm?: number | null;
    fuelTypeId?: string | null;
    transmissionTypeId?: string | null;
    driveTypeId?: string | null;
    bodyTypeId?: string | null;
    colorId?: string | null;
    engineTypeId?: string | null;
    engineSizeCc?: number | null;
    doors?: number | null;
    seats?: number | null;
    vin?: string | null;
    trim?: string | null;
    interiorColor?: string | null;
    brand?: { id: string; nameEn: string } | null;
    model?: { id: string; nameEn: string } | null;
    fuelType?: { nameEn: string } | null;
    transmissionType?: { nameEn: string } | null;
  } | null;
  plateDetails?: {
    formatCode?: string | null;
    regionCode?: string | null;
    series?: string | null;
    number?: string | null;
    plateDisplay?: string | null;
    plateType?: string | null;
  } | null;
};

export function listingTitle(item: AdminListing): string {
  return (
    item.title?.trim() ||
    item.translations?.[0]?.title?.trim() ||
    item.metaTitle?.trim() ||
    item.plateDetails?.plateDisplay?.trim() ||
    item.slug ||
    item.id
  );
}

export type AdminPlate = AdminListing & {
  plateDetails: NonNullable<AdminListing['plateDetails']> & {
    format?: { code: string } | null;
  };
};

export type DealerVerificationStatus =
  | 'UNVERIFIED'
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED';

export type DealerOrganization = {
  id: string;
  name: string;
  slug: string;
  verified: boolean;
  verificationStatus?: DealerVerificationStatus;
  rejectionReason?: string | null;
  bio: string | null;
  phone: string | null;
  followersCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  city?: { id: string; nameEn: string } | null;
  members?: { user: { id: string; displayName: string | null; phone: string | null; role: string } }[];
  statistics?: { cars: number; sold: number; followers: number; views: number };
};

export type AdminUser = {
  id: string;
  displayName: string | null;
  phone: string | null;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  city?: { id: string; nameEn: string } | null;
  _count?: { listings: number };
};

export type ListingReport = {
  id: string;
  listingId: string;
  reporterId: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
  listing?: {
    id: string;
    title: string;
    status: ListingStatus;
    domain?: 'VEHICLE' | 'PLATE';
    categoryCode?: string;
    seller?: { id: string; displayName: string | null } | null;
  } | null;
  reporter?: { id: string; displayName: string | null; phone: string | null } | null;
};

export type SiteSettings = {
  id: string;
  siteName: string;
  maintenanceMode: boolean;
  featuredLimit: number;
  maxImages: number;
  defaultCurrency: string;
  contactInfo: Record<string, unknown> | null;
  socialLinks: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminAuditLog = {
  id: string;
  actorId: string | null;
  action: string;
  module: string;
  entityId: string | null;
  ip: string | null;
  userAgent: string | null;
  before: unknown;
  after: unknown;
  createdAt: string;
  actor?: {
    id: string;
    displayName: string | null;
    phone: string | null;
    email: string | null;
    role: string;
  } | null;
};

export type AdminMediaAsset = {
  id: string;
  mediaType: string;
  status: string;
  filename: string | null;
  mimeType: string;
  byteSize: number;
  originalKey: string;
  ownerId: string | null;
  ownerEntityId: string | null;
  ownerModule: string | null;
  blurDataUrl?: string | null;
  documentPurpose?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  owner?: {
    id: string;
    displayName: string | null;
    email: string | null;
    phone: string | null;
  };
  variants: Array<{
    kind: string;
    r2Key: string;
    mimeType: string;
    width: number | null;
    height: number | null;
  }>;
  urls?: Record<string, string | null>;
};

export type PlateCategory = {
  id: string;
  code: string;
  nameEn: string;
  nameAr?: string | null;
  sortOrder?: number;
  active?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PlatePrefix = {
  id: string;
  formatCode: string;
  letter: string;
  label?: string | null;
  active?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PlateVerification = {
  id: string;
  listingId: string;
  status: string;
  note?: string | null;
  verifiedById?: string | null;
  createdAt: string;
  updatedAt?: string;
};
