import { ApiPropertyOptional } from '@nestjs/swagger';
import { LanguageCode, SellerType } from '@autohub/database';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class NotificationPreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  newMessage?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  listingApproved?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  listingRejected?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  priceChange?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  favouriteUpdate?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  dealerReply?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  system?: boolean;
}

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

  @ApiPropertyOptional({ nullable: true, description: 'Given name (1–80).' })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Family name (1–80).' })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName?: string | null;

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
    description:
      'Legacy/direct avatar URL. Prefer avatarMediaId from MediaAsset upload. Pass null to clear when not using media id.',
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  @MaxLength(2048)
  avatarUrl?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'MediaAsset id (READY, owned by caller). Sets avatarUrl from public/signed URL. Pass null to clear media link.',
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MinLength(1)
  avatarMediaId?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Date of birth (YYYY-MM-DD). Pass null to clear.',
    example: '1990-05-15',
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsDateString({ strict: true })
  dateOfBirth?: string | null;

  @ApiPropertyOptional({
    enum: SellerType,
    description: 'Upserts SellerProfile.type (INDIVIDUAL | DEALER).',
  })
  @IsOptional()
  @IsEnum(SellerType)
  sellerType?: SellerType;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Seller bio (SellerProfile). Max 2000. Pass null to clear.',
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(2000)
  bio?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Public seller display name override (SellerProfile).',
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  sellerDisplayName?: string | null;

  @ApiPropertyOptional({ type: NotificationPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  notificationPreferences?: NotificationPreferencesDto;
}
