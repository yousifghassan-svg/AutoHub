import type { SellDomainPlugin } from './types';

const pluginsById = new Map<string, SellDomainPlugin>();
const categoryToPluginId = new Map<string, string>();

export function registerSellDomain(plugin: SellDomainPlugin): void {
  pluginsById.set(plugin.id, plugin);
  for (const code of plugin.categoryCodes) {
    categoryToPluginId.set(code, plugin.id);
  }
}

export function clearSellDomainRegistry(): void {
  pluginsById.clear();
  categoryToPluginId.clear();
}

export function getSellDomainById(domainId: string): SellDomainPlugin | undefined {
  return pluginsById.get(domainId);
}

export function resolveSellDomain(categoryCode: string): SellDomainPlugin | undefined {
  const id = categoryToPluginId.get(categoryCode);
  if (!id) return undefined;
  return pluginsById.get(id);
}

export function listSellDomains(): SellDomainPlugin[] {
  return Array.from(pluginsById.values());
}
