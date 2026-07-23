import type { WizardDraft } from './types';

function emptyVehicle() {
  return {
    year: '',
    mileageKm: '',
    brandId: null,
    brandLabel: '',
    modelId: null,
    modelLabel: '',
    engineSizeCc: '',
    doors: '',
  };
}

export function createEmptyDraft(partial?: Partial<WizardDraft>): WizardDraft {
  const now = new Date().toISOString();
  return {
    localId: `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    listingId: null,
    step: 'category',
    categoryId: null,
    categoryCode: null,
    categoryLabel: '',
    vehicleTypeCode: null,
    vehicleTypeLabel: '',
    conditionTypeId: null,
    vehicleDetails: emptyVehicle(),
    media: [],
    cityId: null,
    cityLabel: '',
    primaryPrice: '',
    currencyCode: 'IQD',
    primaryCurrencyId: null,
    title: '',
    description: '',
    language: 'ar',
    status: 'local',
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}
