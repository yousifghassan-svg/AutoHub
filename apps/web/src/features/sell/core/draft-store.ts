import {
  DEFAULT_COMMON_STATE,
  type LegacySellDraftV1,
  type PersistedSellDraft,
  type SellCommonState,
  type SellDomainPlugin,
  type SellDraftV2,
  type SellStepId,
  type SellWizardState,
} from './types';
import {
  clampStepId,
  getWorkflow,
  mapLegacyStepToWorkflowStepId,
} from './workflows';
import { resolveSellDomain } from './registry';

export const SELL_DRAFT_KEY = 'autohub.sell.draft';
export const SELL_DRAFT_VERSION = 2 as const;

export type HydratedSellDraft = {
  state: SellWizardState;
  stepId: SellStepId;
  domainId: string;
  workflowId: string;
};

function isLegacyV1(raw: PersistedSellDraft): raw is LegacySellDraftV1 {
  return raw.version === 1;
}

function isV2(raw: PersistedSellDraft): raw is SellDraftV2 {
  return raw.version === 2;
}

export function commonFromLegacyForm(
  form: LegacySellDraftV1['form'],
  imageAssetIds: string[],
  videoAssetIds: string[],
): SellCommonState {
  return {
    ...DEFAULT_COMMON_STATE,
    categoryCode: form.categoryCode ?? DEFAULT_COMMON_STATE.categoryCode,
    categoryId: form.categoryId ?? '',
    governorateId: form.governorateId ?? '',
    cityId: form.cityId ?? '',
    title: form.title ?? '',
    description: form.description ?? '',
    primaryPrice: form.primaryPrice ?? '',
    currencyCode: form.currencyCode ?? 'IQD',
    imageAssetIds,
    videoAssetIds,
  };
}

export function hydrateDraft(
  raw: unknown,
  fallbackPlugin: SellDomainPlugin,
): HydratedSellDraft | null {
  if (!raw || typeof raw !== 'object') return null;
  const draft = raw as PersistedSellDraft;

  if (isV2(draft)) {
    const active =
      resolveSellDomain(draft.common.categoryCode) ?? fallbackPlugin;
    const workflow = getWorkflow(active.workflowId);
    return {
      domainId: active.id,
      workflowId: workflow.id,
      stepId: clampStepId(draft.stepId, workflow),
      state: {
        ...DEFAULT_COMMON_STATE,
        ...draft.common,
        domainData: active.mapDraftToDomain(draft.domainData),
      },
    };
  }

  if (isLegacyV1(draft)) {
    const common = commonFromLegacyForm(
      draft.form ?? {},
      draft.imageAssetIds ?? [],
      draft.videoAssetIds ?? [],
    );
    const active = resolveSellDomain(common.categoryCode) ?? fallbackPlugin;
    const workflow = getWorkflow(active.workflowId);
    return {
      domainId: active.id,
      workflowId: workflow.id,
      stepId: mapLegacyStepToWorkflowStepId(draft.step ?? 0, workflow),
      state: {
        ...common,
        domainData: active.mapDraftToDomain(undefined, draft),
      },
    };
  }

  return null;
}

export function serializeDraft(
  plugin: SellDomainPlugin,
  stepId: SellStepId,
  state: SellWizardState,
): SellDraftV2 {
  const common: SellCommonState = {
    categoryCode: state.categoryCode,
    categoryId: state.categoryId,
    governorateId: state.governorateId,
    cityId: state.cityId,
    title: state.title,
    description: state.description,
    primaryPrice: state.primaryPrice,
    currencyCode: state.currencyCode,
    imageAssetIds: state.imageAssetIds,
    videoAssetIds: state.videoAssetIds,
  };
  return {
    version: SELL_DRAFT_VERSION,
    domainId: plugin.id,
    workflowId: plugin.workflowId,
    stepId,
    common,
    domainData: plugin.serializeDomainData(state.domainData),
  };
}

export function loadDraftFromStorage(
  fallbackPlugin: SellDomainPlugin,
): HydratedSellDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SELL_DRAFT_KEY);
    if (!raw) return null;
    return hydrateDraft(JSON.parse(raw) as unknown, fallbackPlugin);
  } catch {
    return null;
  }
}

export function saveDraftToStorage(
  plugin: SellDomainPlugin,
  stepId: SellStepId,
  state: SellWizardState,
): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    SELL_DRAFT_KEY,
    JSON.stringify(serializeDraft(plugin, stepId, state)),
  );
}

export function clearDraftStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SELL_DRAFT_KEY);
}
