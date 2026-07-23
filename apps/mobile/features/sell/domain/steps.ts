export const WIZARD_STEPS = [
  'category',
  'vehicleType',
  'vehicleDetails',
  'media',
  'location',
  'price',
  'description',
  'preview',
  'submit',
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number];

export const STEP_LABELS: Record<WizardStep, string> = {
  category: 'Category',
  vehicleType: 'Vehicle type',
  vehicleDetails: 'Details',
  media: 'Media',
  location: 'Location',
  price: 'Price',
  description: 'Description',
  preview: 'Preview',
  submit: 'Submit',
};

export function stepIndex(step: WizardStep): number {
  return WIZARD_STEPS.indexOf(step);
}

export function nextStep(step: WizardStep): WizardStep | null {
  const i = stepIndex(step);
  return i < 0 || i >= WIZARD_STEPS.length - 1 ? null : WIZARD_STEPS[i + 1];
}

export function prevStep(step: WizardStep): WizardStep | null {
  const i = stepIndex(step);
  return i <= 0 ? null : WIZARD_STEPS[i - 1];
}

export function progressPercent(step: WizardStep): number {
  const i = stepIndex(step);
  if (i < 0) return 0;
  return Math.round(((i + 1) / WIZARD_STEPS.length) * 100);
}
