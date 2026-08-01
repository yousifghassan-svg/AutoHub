import {
  DEFAULT_PLATE_FORM,
  type PlateFormState,
} from '../components/PlateEditor';

export type PlateSellDomainData = {
  plate: PlateFormState;
};

export const DEFAULT_PLATE_DOMAIN_DATA: PlateSellDomainData = {
  plate: { ...DEFAULT_PLATE_FORM },
};

export function asPlateDomainData(
  raw: Record<string, unknown>,
): PlateSellDomainData {
  const plateRaw =
    raw.plate && typeof raw.plate === 'object'
      ? (raw.plate as Partial<PlateFormState>)
      : {};
  return {
    plate: { ...DEFAULT_PLATE_FORM, ...plateRaw },
  };
}
