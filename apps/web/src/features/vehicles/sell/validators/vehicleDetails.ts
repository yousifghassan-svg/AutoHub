import type { SellStepValidator } from '@/features/sell/core/types';
import { asVehicleDomainData } from '../domain-data';

export const validateVehicleDetailsStep: SellStepValidator = (state) => {
  const data = asVehicleDomainData(state.domainData);
  return (
    state.title.trim().length >= 3 &&
    Boolean(data.year) &&
    Number(data.year) >= 1950 &&
    state.description.trim().length >= 10
  );
};
