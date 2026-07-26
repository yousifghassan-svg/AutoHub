import { getHttpClient } from '@/lib/api/client';
import { createCatalogRepository, type CatalogRepository } from './data/catalog.repository';

let repository: CatalogRepository | null = null;

export function getCatalogRepository(): CatalogRepository {
  if (!repository) repository = createCatalogRepository(getHttpClient());
  return repository;
}
