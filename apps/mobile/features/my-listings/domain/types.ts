export type ListingStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'ACTIVE'
  | 'RESERVED'
  | 'SOLD'
  | 'ARCHIVED'
  | 'REJECTED';

export type StatusTab = 'ALL' | ListingStatus;

export type ManagedListing = {
  id: string;
  slug: string;
  title: string;
  status: ListingStatus;
  price: number | null;
  currencyCode: string;
  location: string;
  imageUrl: string | null;
  categoryCode: string;
  isFeatured: boolean;
  isVerified: boolean;
  publishedAt: string | null;
  soldAt: string | null;
  updatedAt: string;
  stats: ListingStats;
  /** Raw fields for duplicate / edit */
  description: string;
  cityId: string;
  categoryId: string;
  primaryCurrencyId: string | null;
};

export type ListingStats = {
  views: number;
  favorites: number;
  /** Not exposed by API yet — shown as placeholder */
  phoneClicks: number | null;
  whatsappClicks: number | null;
  shares: number | null;
};

export type ManagedListingsPage = {
  items: ManagedListing[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type EditListingInput = {
  title: string;
  description: string;
  primaryPrice?: number;
  currencyCode?: 'IQD' | 'USD' | string;
};

export const STATUS_TABS: Array<{ key: StatusTab; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'DRAFT', label: 'Drafts' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'ACTIVE', label: 'Published' },
  { key: 'RESERVED', label: 'Reserved' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'SOLD', label: 'Sold' },
  { key: 'ARCHIVED', label: 'Archived' },
];

/** Owner-allowed transitions (PENDING→ACTIVE excluded — moderator only). */
export const OWNER_TRANSITIONS: Record<ListingStatus, ListingStatus[]> = {
  DRAFT: ['PENDING', 'ARCHIVED'],
  PENDING: ['DRAFT', 'ARCHIVED'],
  ACTIVE: ['RESERVED', 'SOLD', 'ARCHIVED'],
  RESERVED: ['ACTIVE', 'SOLD', 'ARCHIVED'],
  REJECTED: ['DRAFT', 'PENDING', 'ARCHIVED'],
  SOLD: ['ARCHIVED'],
  ARCHIVED: [],
};
