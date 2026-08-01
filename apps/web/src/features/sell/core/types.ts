import type { ComponentType } from 'react';

/** Opaque step identifier — domains define their own ids. */
export type SellStepId = string;

/** Reusable workflow definition (categories reference by id, never copy steps). */
export type SellWorkflowDefinition = {
  readonly id: string;
  readonly steps: ReadonlyArray<{
    readonly id: SellStepId;
    readonly label: string;
  }>;
};

/** Marketplace-common fields shared across all sell domains. */
export type SellCommonState = {
  categoryCode: string;
  categoryId: string;
  governorateId: string;
  cityId: string;
  title: string;
  description: string;
  primaryPrice: string;
  currencyCode: string;
  imageAssetIds: string[];
  videoAssetIds: string[];
};

/** Wizard state: common fields + opaque domain payload. */
export type SellWizardState = SellCommonState & {
  domainData: Record<string, unknown>;
};

export type SellStepProps = {
  state: SellWizardState;
  patchCommon: (patch: Partial<SellCommonState>) => void;
  patchDomain: (patch: Record<string, unknown>) => void;
};

export type SellStepValidator = (state: SellWizardState) => boolean;

export type SellSubmitResult = {
  listingId: string;
};

export type SellSubmitArgs = {
  state: SellWizardState;
  submitForReview: boolean;
  attachMedia: (listingId: string) => Promise<void>;
};

/**
 * Marketplace domain plugin. The Sell Wizard only depends on this contract —
 * it never imports vehicle/plate (or future domain) modules.
 */
export type SellDomainPlugin = {
  readonly id: string;
  readonly categoryCodes: readonly string[];
  /** References a reusable workflow from the workflow registry. */
  readonly workflowId: string;
  /**
   * Domain-owned step components keyed by step id.
   * Shared steps (category, media, saleInformation, publish) are resolved
   * from the shared step map when not provided here.
   */
  readonly steps: Readonly<Partial<Record<SellStepId, ComponentType<SellStepProps>>>>;
  /** Preview content rendered inside the shared Publish step. */
  readonly Preview: ComponentType<SellStepProps>;
  readonly validators: Readonly<Partial<Record<SellStepId, SellStepValidator>>>;
  createInitialDomainData: () => Record<string, unknown>;
  /**
   * Optional: adjust domain payload when the user switches category
   * within this domain (e.g. clear vehicle brand/model).
   */
  onCategoryChange?: (
    domainData: Record<string, unknown>,
    nextCategoryCode: string,
  ) => Record<string, unknown>;
  /** Hydrate domainData from persisted draft payload (v2) or legacy draft. */
  mapDraftToDomain: (raw: unknown, legacy?: LegacySellDraftV1) => Record<string, unknown>;
  serializeDomainData: (domainData: Record<string, unknown>) => unknown;
  /** Whether required domain steps are complete enough to publish. */
  canSubmit: (state: SellWizardState) => boolean;
  submit: (args: SellSubmitArgs) => Promise<SellSubmitResult>;
};

/** Legacy web sell draft (pre–dynamic wizard). */
export type LegacySellDraftV1 = {
  version: 1;
  step: number;
  form: {
    categoryCode?: string;
    categoryId?: string;
    governorateId?: string;
    cityId?: string;
    title?: string;
    description?: string;
    primaryPrice?: string;
    currencyCode?: string;
    year?: string;
    mileageKm?: string;
    brandId?: string;
    modelId?: string;
  };
  plate?: Record<string, unknown>;
  imageAssetIds?: string[];
  videoAssetIds?: string[];
};

export type SellDraftV2 = {
  version: 2;
  domainId: string;
  workflowId: string;
  stepId: SellStepId;
  common: SellCommonState;
  domainData: unknown;
};

export type PersistedSellDraft = LegacySellDraftV1 | SellDraftV2;

export const DEFAULT_COMMON_STATE: SellCommonState = {
  categoryCode: 'CAR',
  categoryId: '',
  governorateId: '',
  cityId: '',
  title: '',
  description: '',
  primaryPrice: '',
  currencyCode: 'IQD',
  imageAssetIds: [],
  videoAssetIds: [],
};
