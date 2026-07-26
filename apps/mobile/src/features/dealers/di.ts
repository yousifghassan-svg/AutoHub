import { getHttpClient } from '@/lib/api/client';
import { createDealersRepository, type DealersRepository } from './data/dealers.repository';

let repository: DealersRepository | null = null;

export function getDealersRepository(): DealersRepository {
  if (!repository) repository = createDealersRepository(getHttpClient());
  return repository;
}
