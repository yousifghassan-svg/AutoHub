'use client';

import { Input } from '@/components/ui';
import {
  GOVERNORATES,
  buildPlateDisplay,
  formatCodeFor,
} from '../domain/governorates';
import {
  IRAQI_GOVERNORATES,
  PLATE_TYPES,
  type IraqiGovernorate,
  type LicensePlateProps,
  type PlateType,
} from '../domain/types';
import { LicensePlate } from './LicensePlate';

export type PlateFormState = LicensePlateProps;

export const DEFAULT_PLATE_FORM: PlateFormState = {
  governorate: 'Erbil',
  code: GOVERNORATES.Erbil.defaultCode,
  letter: 'X',
  number: '60000',
  type: 'Private',
};

export function PlateEditor({
  value,
  onChange,
  showExport = true,
}: {
  value: PlateFormState;
  onChange: (next: PlateFormState) => void;
  showExport?: boolean;
}) {
  const set = <K extends keyof PlateFormState>(key: K, next: PlateFormState[K]) => {
    if (key === 'governorate') {
      const gov = next as IraqiGovernorate;
      onChange({
        ...value,
        governorate: gov,
        code: GOVERNORATES[gov].defaultCode,
      });
      return;
    }
    onChange({ ...value, [key]: next });
  };

  return (
    <div className="space-y-5">
      <LicensePlate {...value} size="fill" showExport={showExport} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-ink">Governorate</span>
          <select
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-ink"
            value={value.governorate}
            onChange={(e) => set('governorate', e.target.value as IraqiGovernorate)}
          >
            {IRAQI_GOVERNORATES.map((g) => (
              <option key={g} value={g}>
                {GOVERNORATES[g].nameEn} · {GOVERNORATES[g].nameAr}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-ink">Plate type</span>
          <select
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-ink"
            value={value.type}
            onChange={(e) => set('type', e.target.value as PlateType)}
          >
            {PLATE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <Input
          label="Governorate code"
          value={value.code}
          onChange={(e) => set('code', e.target.value.toUpperCase())}
          maxLength={4}
        />
        <Input
          label="Letter"
          value={value.letter}
          onChange={(e) => set('letter', e.target.value.toUpperCase())}
          maxLength={3}
        />
        <Input
          label="Number"
          value={value.number}
          onChange={(e) => set('number', e.target.value.replace(/[^\d]/g, ''))}
          maxLength={7}
          className="sm:col-span-2"
        />
      </div>

      <p className="text-xs text-ink-secondary">
        Preview updates instantly · Format {formatCodeFor(value.governorate)} · Display{' '}
        <span className="font-medium text-ink">
          {buildPlateDisplay(value.code, value.letter, value.number)}
        </span>
      </p>
    </div>
  );
}

export function plateFormToApiDetails(form: PlateFormState) {
  return {
    formatCode: formatCodeFor(form.governorate),
    plateDisplay: buildPlateDisplay(form.code, form.letter, form.number),
    plateNormalized: buildPlateDisplay(form.code, form.letter, form.number)
      .replace(/\s+/g, '')
      .toUpperCase(),
    series: form.letter.trim().toUpperCase(),
    number: form.number.trim(),
    regionCode: form.code.trim(),
    plateType: form.type,
    governorate: form.governorate,
  };
}
