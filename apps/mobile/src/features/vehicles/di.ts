import { getHttpClient } from '@/lib/api/client';
import { createVehiclesRepository, type VehiclesRepository } from './data/vehicles.repository';

let repository: VehiclesRepository | null = null;

export function getVehiclesRepository(locale: 'ar' | 'ku' | 'en' = 'ar'): VehiclesRepository {
  if (!repository) {
    repository = createVehiclesRepository(getHttpClient(), locale);
  }
  return repository;
}

export function __resetVehiclesRepository() {
  repository = null;
}
