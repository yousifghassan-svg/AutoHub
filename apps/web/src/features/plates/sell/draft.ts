import type { LegacySellDraftV1 } from '@/features/sell/core/types';
import { DEFAULT_PLATE_FORM, type PlateFormState } from '../components/PlateEditor';
import {
  DEFAULT_PLATE_DOMAIN_DATA,
  asPlateDomainData,
  type PlateSellDomainData,
} from './domain-data';

export function createInitialPlateDomainData(): Record<string, unknown> {
  return {
    plate: { ...DEFAULT_PLATE_FORM },
  } satisfies PlateSellDomainData;
}

export function mapPlateDraftToDomain(
  raw: unknown,
  legacy?: LegacySellDraftV1,
): Record<string, unknown> {
  if (legacy?.plate) {
    return {
      plate: {
        ...DEFAULT_PLATE_FORM,
        ...(legacy.plate as Partial<PlateFormState>),
      },
    } satisfies PlateSellDomainData;
  }

  if (raw && typeof raw === 'object') {
    return asPlateDomainData(raw as Record<string, unknown>);
  }

  return { ...DEFAULT_PLATE_DOMAIN_DATA, plate: { ...DEFAULT_PLATE_FORM } };
}

export function serializePlateDomainData(
  domainData: Record<string, unknown>,
): PlateSellDomainData {
  return asPlateDomainData(domainData);
}
