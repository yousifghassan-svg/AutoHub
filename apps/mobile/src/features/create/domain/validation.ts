import { z } from 'zod';
import type { PlateDraft } from './plate-draft';
import type { VehicleDraft } from './vehicle-draft';

export function validateVehicleStep(draft: VehicleDraft): string | null {
  switch (draft.step) {
    case 'category':
      return draft.categoryId ? null : 'Select a vehicle category';
    case 'brand':
      return draft.brandId ? null : 'Select a brand';
    case 'model':
      return draft.modelId ? null : 'Select a model';
    case 'year': {
      const year = Number(draft.year);
      if (!Number.isFinite(year) || year < 1950 || year > new Date().getFullYear() + 1) {
        return 'Enter a valid year';
      }
      return null;
    }
    case 'specs':
      return draft.fuelTypeId && draft.transmissionTypeId && draft.mileageKm
        ? null
        : 'Complete fuel, transmission, and mileage';
    case 'price': {
      const price = Number(draft.primaryPrice);
      return Number.isFinite(price) && price > 0 ? null : 'Enter a valid price';
    }
    case 'description':
      if (draft.title.trim().length < 3) return 'Title must be at least 3 characters';
      if (draft.description.trim().length < 10) return 'Description must be at least 10 characters';
      if (!draft.cityId) return 'Select a city';
      return null;
    case 'photos':
      return draft.media.length > 0 ? null : 'Add at least one photo';
    case 'preview':
      return null;
    default:
      return null;
  }
}

export function validatePlateStep(draft: PlateDraft): string | null {
  switch (draft.step) {
    case 'province':
      return draft.formatCode && draft.regionCode ? null : 'Select a province';
    case 'category':
      return draft.plateCategoryId || draft.categoryId ? null : 'Select a plate category';
    case 'prefix':
      return draft.series.trim().length > 0 ? null : 'Enter or select a prefix';
    case 'number': {
      const number = draft.number.trim();
      if (!number) return 'Enter the plate number';
      if (draft.digits && String(number.length) !== draft.digits && draft.digits !== 'any') {
        // digits is advisory
      }
      return null;
    }
    case 'price': {
      const price = Number(draft.primaryPrice);
      return Number.isFinite(price) && price > 0 ? null : 'Enter a valid price';
    }
    case 'description':
      if (draft.description.trim().length < 10) return 'Description must be at least 10 characters';
      if (!draft.cityId) return 'Select a city';
      return null;
    case 'photos':
      return null; // plates can publish with SVG-only later; photos optional
    case 'preview':
      return null;
    default:
      return null;
  }
}

export const priceSchema = z.object({
  primaryPrice: z.coerce.number().positive(),
  currencyCode: z.enum(['IQD', 'USD']),
});
