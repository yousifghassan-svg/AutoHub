'use client';

import { useEffect, useMemo } from 'react';
import { usePlateSellPlugin } from '@/features/plates/sell';
import { useVehicleSellPlugin } from '@/features/vehicles/sell';
import {
  clearSellDomainRegistry,
  listSellDomains,
  registerSellDomain,
} from './core/registry';
import type { SellDomainPlugin } from './core/types';

/**
 * Composition root: register marketplace domain plugins.
 * Add future domains here (Real Estate, Boats, Jobs, …) without changing SellWizard.
 */
export function useSellDomainPlugins(): SellDomainPlugin[] {
  const vehicle = useVehicleSellPlugin();
  const plate = usePlateSellPlugin();

  const plugins = useMemo(() => [vehicle, plate], [plate, vehicle]);

  useEffect(() => {
    clearSellDomainRegistry();
    for (const plugin of plugins) {
      registerSellDomain(plugin);
    }
  }, [plugins]);

  // Prefer live plugin instances (with bound submit) over registry copies.
  return plugins.length ? plugins : listSellDomains();
}

export function resolvePluginFromList(
  plugins: SellDomainPlugin[],
  categoryCode: string,
): SellDomainPlugin {
  return (
    plugins.find((p) => p.categoryCodes.includes(categoryCode)) ??
    plugins[0]!
  );
}
