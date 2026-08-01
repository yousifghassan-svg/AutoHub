import { config } from '@/lib/config';
import { getHttpClient } from '@/lib/api/client';
import {
  createApiHomeRepository,
  createMockHomeRepository,
  type HomeRepository,
} from './data/home.repository';
import { createRecentlyViewedStore } from './data/recently-viewed.storage';

let repository: HomeRepository | null = null;

export function getHomeRepository(): HomeRepository {
  if (repository) return repository;

  const recentlyViewed = createRecentlyViewedStore();

  repository =
    config.authMode === 'dev'
      ? createMockHomeRepository({ recentlyViewed })
      : createApiHomeRepository({ http: getHttpClient(), recentlyViewed });

  return repository;
}

export function __setHomeRepositoryForTests(next: HomeRepository | null) {
  repository = next;
}
