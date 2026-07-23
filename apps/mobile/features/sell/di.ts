import { config } from '@/lib/config';
import { getHttpClient } from '@/lib/api/client';
import { createDraftStore } from './data/draft-store';
import { createMockSellRepository } from './data/mock-sell.repository';
import { createApiSellRepository } from './data/sell.repository';
import type { SellRepository } from './data/sell.repository.types';

let repository: SellRepository | null = null;

export function getSellRepository(): SellRepository {
  if (repository) return repository;
  const drafts = createDraftStore();
  repository =
    config.authMode === 'mock'
      ? createMockSellRepository({ drafts })
      : createApiSellRepository({ http: getHttpClient(), drafts });
  return repository;
}

export function __setSellRepositoryForTests(next: SellRepository | null) {
  repository = next;
}
