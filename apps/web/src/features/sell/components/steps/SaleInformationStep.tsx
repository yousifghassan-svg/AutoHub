'use client';

import { Input } from '@/components/ui';
import { CurrencySelect } from '@/features/currencies/components/CurrencySelect';
import type { SellStepProps } from '../../core/types';
import { priceStepForCurrency } from '../../lib/listing-price';

export function SaleInformationStep({ state, patchCommon }: SellStepProps) {
  const currency = state.currencyCode || 'IQD';

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencySelect
          value={currency}
          onChange={(currencyCode) => patchCommon({ currencyCode })}
        />
        <Input
          label={`Price (${currency})`}
          type="number"
          min={0}
          step={priceStepForCurrency(currency)}
          value={state.primaryPrice}
          onChange={(e) => patchCommon({ primaryPrice: e.target.value })}
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={state.negotiable}
          onChange={(e) => patchCommon({ negotiable: e.target.checked })}
          className="rounded border-border"
        />
        Price is negotiable
      </label>
      <p className="text-xs text-ink-secondary">
        Negotiable is stored with the listing description until a dedicated API
        field exists. Currency and price apply to every listing type.
      </p>
    </div>
  );
}
