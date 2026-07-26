import { getHttpClient } from '@/lib/api/client';
import { createPlatesRepository, type PlatesRepository } from './data/plates.repository';

let repository: PlatesRepository | null = null;

export function getPlatesRepository(locale: 'ar' | 'ku' | 'en' = 'ar'): PlatesRepository {
  if (!repository) {
    repository = createPlatesRepository(getHttpClient(), locale);
  }
  return repository;
}

export function __resetPlatesRepository() {
  repository = null;
}
