import { getHttpClient } from '@/lib/api/client';
import { getVehicleCreateRepository } from './data/vehicle-create.repository';
import { getPlateCreateRepository } from './data/plate-create.repository';

export function vehicleCreateRepo() {
  return getVehicleCreateRepository(getHttpClient());
}

export function plateCreateRepo() {
  return getPlateCreateRepository(getHttpClient());
}
