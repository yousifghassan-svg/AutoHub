import type { CreateMediaItem } from './media';

export type VehicleWizardStep =
  | 'category'
  | 'brand'
  | 'model'
  | 'year'
  | 'specs'
  | 'price'
  | 'description'
  | 'photos'
  | 'preview';

export const VEHICLE_STEPS: VehicleWizardStep[] = [
  'category',
  'brand',
  'model',
  'year',
  'specs',
  'price',
  'description',
  'photos',
  'preview',
];

export const VEHICLE_STEP_LABELS: Record<VehicleWizardStep, string> = {
  category: 'Category',
  brand: 'Brand',
  model: 'Model',
  year: 'Year',
  specs: 'Specifications',
  price: 'Price',
  description: 'Description',
  photos: 'Photos',
  preview: 'Preview & publish',
};

export type VehicleDraft = {
  localId: string;
  listingId: string | null;
  step: VehicleWizardStep;
  categoryId: string | null;
  categoryCode: string | null;
  categoryLabel: string;
  brandId: string | null;
  brandLabel: string;
  modelId: string | null;
  modelLabel: string;
  year: string;
  fuelTypeId: string | null;
  transmissionTypeId: string | null;
  bodyTypeId: string | null;
  driveTypeId: string | null;
  colorId: string | null;
  engineTypeId: string | null;
  conditionTypeId: string | null;
  mileageKm: string;
  engineSizeCc: string;
  vin: string;
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

export function createEmptyVehicleDraft(): VehicleDraft {
  const now = new Date().toISOString();
  return {
    localId: `veh_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    listingId: null,
    step: 'category',
    categoryId: null,
    categoryCode: null,
    categoryLabel: '',
    brandId: null,
    brandLabel: '',
    modelId: null,
    modelLabel: '',
    year: String(new Date().getFullYear()),
    fuelTypeId: null,
    transmissionTypeId: null,
    bodyTypeId: null,
    driveTypeId: null,
    colorId: null,
    engineTypeId: null,
    conditionTypeId: null,
    mileageKm: '',
    engineSizeCc: '',
    vin: '',
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

export function vehicleStepIndex(step: VehicleWizardStep): number {
  return VEHICLE_STEPS.indexOf(step);
}

export function vehicleProgress(step: VehicleWizardStep): number {
  return Math.round(((vehicleStepIndex(step) + 1) / VEHICLE_STEPS.length) * 100);
}
