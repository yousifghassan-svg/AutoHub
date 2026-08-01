import { ApiPropertyOptional } from '@nestjs/swagger';
import { LanguageCode } from '@autohub/database';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

/**
 * PATCH /v1/auth/me body.
 * Required fields (displayName, cityId) cannot be null.
 * Optional fields may be cleared with explicit null.
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Display name (2–80). Cannot be cleared with null.',
  })
  @ValidateIf((_, v) => v !== undefined)
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName?: string;

  @ApiPropertyOptional({
    description: 'City catalog id. Governorate is derived. Cannot be cleared with null.',
  })
  @ValidateIf((_, v) => v !== undefined)
  @IsString()
  @MinLength(1)
  cityId?: string;

  @ApiPropertyOptional({
    enum: LanguageCode,
    nullable: true,
    description: 'Preferred language. Pass null to clear.',
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsEnum(LanguageCode)
  preferredLanguage?: LanguageCode | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Contact email. Pass null to clear.',
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsEmail()
  @MaxLength(254)
  email?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Profile image URL (MediaAsset deferred to 0.3). Pass null to clear.',
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  @MaxLength(2048)
  avatarUrl?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Date of birth (YYYY-MM-DD). Pass null to clear.',
    example: '1990-05-15',
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsDateString({ strict: true })
  dateOfBirth?: string | null;
}
