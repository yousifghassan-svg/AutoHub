import type { CreateMediaItem } from './media';

export type PlateWizardStep =
  | 'province'
  | 'category'
  | 'prefix'
  | 'number'
  | 'price'
  | 'description'
  | 'photos'
  | 'preview';

export const PLATE_STEPS: PlateWizardStep[] = [
  'province',
  'category',
  'prefix',
  'number',
  'price',
  'description',
  'photos',
  'preview',
];

export const PLATE_STEP_LABELS: Record<PlateWizardStep, string> = {
  province: 'Province',
  category: 'Category',
  prefix: 'Prefix',
  number: 'Number',
  price: 'Price',
  description: 'Description',
  photos: 'Photos',
  preview: 'Preview & publish',
};

export type PlateDraft = {
  localId: string;
  listingId: string | null;
  step: PlateWizardStep;
  provinceId: string | null;
  provinceLabel: string;
  formatCode: string | null;
  regionCode: string;
  plateCategoryId: string | null;
  plateCategoryLabel: string;
  platePrefixId: string | null;
  series: string;
  number: string;
  digits: string;
  categoryId: string | null;
  cityId: string | null;
  cityLabel: string;
  primaryPrice: string;
  currencyCode: 'IQD' | 'USD';
  negotiable: boolean;
  title: string;
  description: string;
  media: CreateMediaItem[];
  status: 'local' | 'draft' | 'pending' | 'submitted';
  createdAt: string;
  updatedAt: string;
};

export function createEmptyPlateDraft(): PlateDraft {
  const now = new Date().toISOString();
  return {
    localId: `plt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    listingId: null,
    step: 'province',
    provinceId: null,
    provinceLabel: '',
    formatCode: null,
    regionCode: '',
    plateCategoryId: null,
    plateCategoryLabel: '',
    platePrefixId: null,
    series: '',
    number: '',
    digits: '',
    categoryId: null,
    cityId: null,
    cityLabel: '',
    primaryPrice: '',
    currencyCode: 'IQD',
    negotiable: false,
    title: '',
    description: '',
    media: [],
    status: 'local',
    createdAt: now,
    updatedAt: now,
  };
}

export function plateStepIndex(step: PlateWizardStep): number {
  return PLATE_STEPS.indexOf(step);
}

export function plateProgress(step: PlateWizardStep): number {
  return Math.round(((plateStepIndex(step) + 1) / PLATE_STEPS.length) * 100);
}
