import type { SellStepValidator } from '@/features/sell/core/types';
import { asPlateDomainData } from '../domain-data';

function isPlateFieldsValid(plate: {
  code: string;
  letter: string;
  number: string;
}): boolean {
  return Boolean(
    plate.code.trim() && plate.letter.trim() && plate.number.trim(),
  );
}

export const validatePlateDetailsStep: SellStepValidator = (state) => {
  const { plate } = asPlateDomainData(state.domainData);
  return isPlateFieldsValid(plate) && state.description.trim().length >= 10;
};
