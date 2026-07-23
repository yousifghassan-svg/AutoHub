import { z } from 'zod';
import type { WizardStep } from './steps';
import type { WizardDraft } from './types';

export const vehicleDetailsSchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/, 'Enter a 4-digit year')
    .refine((y) => {
      const n = Number(y);
      return n >= 1950 && n <= 2100;
    }, 'Year out of range'),
  mileageKm: z
    .string()
    .optional()
    .refine((v) => !v || /^\d+$/.test(v), 'Mileage must be a number'),
});

export const priceSchema = z.object({
  primaryPrice: z
    .string()
    .min(1, 'Enter a price')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, 'Invalid price'),
});

export const descriptionSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
});

export type StepValidation = { ok: true } | { ok: false; message: string };

export function validateStep(draft: WizardDraft, step: WizardStep): StepValidation {
  switch (step) {
    case 'category':
      return draft.categoryId
        ? { ok: true }
        : { ok: false, message: 'Choose a category to continue' };
    case 'vehicleType':
      return draft.vehicleTypeCode
        ? { ok: true }
        : { ok: false, message: 'Choose a vehicle type / condition' };
    case 'vehicleDetails': {
      if (draft.categoryCode === 'PLATE' || draft.categoryCode === 'HEAVY_EQUIPMENT') {
        return { ok: true };
      }
      const parsed = vehicleDetailsSchema.safeParse(draft.vehicleDetails);
      return parsed.success
        ? { ok: true }
        : { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid details' };
    }
    case 'media':
      return draft.media.length > 0
        ? { ok: true }
        : { ok: false, message: 'Add at least one photo or video' };
    case 'location':
      return draft.cityId ? { ok: true } : { ok: false, message: 'Choose a city' };
    case 'price': {
      const parsed = priceSchema.safeParse({ primaryPrice: draft.primaryPrice });
      return parsed.success
        ? { ok: true }
        : { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid price' };
    }
    case 'description': {
      const parsed = descriptionSchema.safeParse({
        title: draft.title,
        description: draft.description,
      });
      return parsed.success
        ? { ok: true }
        : { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid description' };
    }
    case 'preview':
    case 'submit':
      return { ok: true };
    default:
      return { ok: true };
  }
}

export function canSubmit(draft: WizardDraft): StepValidation {
  const gates: WizardStep[] = [
    'category',
    'vehicleType',
    'vehicleDetails',
    'media',
    'location',
    'price',
    'description',
  ];
  for (const step of gates) {
    const result = validateStep(draft, step);
    if (!result.ok) return result;
  }
  return { ok: true };
}
