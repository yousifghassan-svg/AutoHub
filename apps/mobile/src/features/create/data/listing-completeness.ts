import { ApiError } from '@/lib/api/types';

export type CompletenessFieldError = {
  field: string;
  message: string;
  step?: string;
};

export function parseListingCompletenessError(error: unknown): {
  message: string;
  errors: CompletenessFieldError[];
} | null {
  if (!(error instanceof ApiError)) return null;
  if (error.code !== 'LISTING_INCOMPLETE') return null;
  const details = error.details as { errors?: CompletenessFieldError[] } | undefined;
  const errors = Array.isArray(details?.errors) ? details.errors : [];
  return {
    message:
      typeof error.message === 'string'
        ? error.message
        : 'Listing is incomplete and cannot be submitted for review',
    errors,
  };
}

export function formatCompletenessMessage(error: unknown): string {
  const parsed = parseListingCompletenessError(error);
  if (!parsed) {
    return error instanceof Error ? error.message : 'Publish failed';
  }
  if (parsed.errors.length) {
    return parsed.errors.map((e) => e.message).join(' · ');
  }
  return parsed.message;
}
