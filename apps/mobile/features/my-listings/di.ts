import { config } from '@/lib/config';
import { getHttpClient } from '@/lib/api/client';
import { createMyListingsCache } from './data/my-listings-cache';
import {
  createApiMyListingsRepository,
  createMockMyListingsRepository,
  type MyListingsRepository,
} from './data/my-listings.repository';

let repository: MyListingsRepository | null = null;

export function getMyListingsRepository(): MyListingsRepository {
  if (repository) return repository;
  const cache = createMyListingsCache();
  repository =
    config.authMode === 'mock'
      ? createMockMyListingsRepository({ cache })
      : createApiMyListingsRepository({ http: getHttpClient(), cache });
  return repository;
}

export function __setMyListingsRepositoryForTests(next: MyListingsRepository | null) {
  repository = next;
}
