'use client';

import { Input } from '@/components/ui';
import { CurrencySelect } from '@/features/currencies/components/CurrencySelect';
import type { SellStepProps } from '../../core/types';

export function SaleInformationStep({ state, patchCommon }: SellStepProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CurrencySelect
        value={state.currencyCode}
        onChange={(currencyCode) => patchCommon({ currencyCode })}
      />
      <Input
        label={`Price (${state.currencyCode || 'IQD'})`}
        type="number"
        min={0}
        step={state.currencyCode === 'USD' ? '0.01' : '1'}
        value={state.primaryPrice}
        onChange={(e) => patchCommon({ primaryPrice: e.target.value })}
        required
      />
    </div>
  );
}
