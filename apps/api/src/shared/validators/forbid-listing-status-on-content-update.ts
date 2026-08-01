import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListingStatus } from '@autohub/database';
import {
  IsEnum,
  Validate,
  ValidateIf,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export const LISTING_STATUS_CONTENT_UPDATE_FORBIDDEN_MESSAGE =
  'Listing status cannot be modified through this endpoint. Use the dedicated status transition endpoint.';

/**
 * Architectural rule: content PATCH/update DTOs must not accept lifecycle `status`.
 * Transitions go through ListingsService.changeStatus / admin approve|reject only.
 */
@ValidatorConstraint({ name: 'forbidListingStatusOnContentUpdate', async: false })
export class ForbidListingStatusOnContentUpdateConstraint
  implements ValidatorConstraintInterface
{
  validate(): boolean {
    return false;
  }

  defaultMessage(): string {
    return LISTING_STATUS_CONTENT_UPDATE_FORBIDDEN_MESSAGE;
  }
}

/** Rejects any client-supplied `status` on a content-update DTO (Option B). */
export function ForbidListingStatusOnContentUpdate() {
  return applyDecorators(
    ApiPropertyOptional({
      enum: ListingStatus,
      deprecated: true,
      description: LISTING_STATUS_CONTENT_UPDATE_FORBIDDEN_MESSAGE,
    }),
    ValidateIf((_object, value) => value !== undefined),
    IsEnum(ListingStatus),
    Validate(ForbidListingStatusOnContentUpdateConstraint),
  );
}
