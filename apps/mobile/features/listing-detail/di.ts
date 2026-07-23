import { config } from '@/lib/config';
import { getHttpClient } from '@/lib/api/client';
import { createDetailCache } from './data/detail-cache';
import {
  createApiListingDetailRepository,
  createMockListingDetailRepository,
  type ListingDetailRepository,
} from './data/listing-detail.repository';

let repository: ListingDetailRepository | null = null;

export function getListingDetailRepository(): ListingDetailRepository {
  if (repository) return repository;
  const cache = createDetailCache();
  repository =
    config.authMode === 'mock'
      ? createMockListingDetailRepository({ cache })
      : createApiListingDetailRepository({ http: getHttpClient(), cache });
  return repository;
}

export function __setListingDetailRepositoryForTests(next: ListingDetailRepository | null) {
  repository = next;
}
