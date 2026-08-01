'use client';

import { Input, TextArea } from '@/components/ui';
import {
  PlateEditor,
  type PlateFormState,
} from '../../components/PlateEditor';
import type { SellStepProps } from '@/features/sell/core/types';
import { asPlateDomainData } from '../domain-data';

function plateTitle(plate: PlateFormState): string {
  return `${plate.governorate} plate ${plate.code} ${plate.letter} ${plate.number}`;
}

export function PlateDetailsStep({
  state,
  patchCommon,
  patchDomain,
}: SellStepProps) {
  const { plate } = asPlateDomainData(state.domainData);

  return (
    <div className="space-y-4">
      <Input
        label="Title (optional — auto from plate)"
        value={state.title}
        onChange={(e) => patchCommon({ title: e.target.value })}
        placeholder={plateTitle(plate)}
      />
      <PlateEditor
        value={plate}
        onChange={(next) => patchDomain({ plate: next })}
        showExport
      />
      <TextArea
        label="Description"
        value={state.description}
        onChange={(e) => patchCommon({ description: e.target.value })}
      />
      <p className="text-xs text-ink-secondary">Minimum 10 characters</p>
    </div>
  );
}
