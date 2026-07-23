import type { ListingCategoryCode, ListingStatus } from '@autohub/database';

export type SearchListingsInput = {
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'primaryPrice' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
  cityId?: string;
  governorateId?: string;
  categoryId?: string;
  categoryCode?: ListingCategoryCode;
  brandId?: string;
  modelId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ListingStatus;
  statuses?: ListingStatus[];
  isFeatured?: boolean;
  keyword?: string;
  sellerId?: string;
  mine?: boolean;
};
