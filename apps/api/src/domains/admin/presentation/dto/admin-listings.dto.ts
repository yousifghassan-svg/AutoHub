import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  LanguageCode,
  ListingCategoryCode,
  ListingStatus,
} from '@autohub/database';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { VehicleDetailsDto } from '../../../listings/presentation/dto/vehicle-details.dto';
import { ForbidListingStatusOnContentUpdate } from '../../../../shared/validators/forbid-listing-status-on-content-update';
import { AdminPaginationDto } from './admin-common.dto';

function toBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return undefined;
}

export class AdminListingsQueryDto extends AdminPaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cityId?: string;

  @ApiPropertyOptional({ description: 'Alias for cityId filter' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Alias for brandId filter' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modelId?: string;

  @ApiPropertyOptional({ description: 'Alias for modelId filter' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ enum: ListingStatus })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiPropertyOptional({ description: 'Alias for sellerId' })
  @IsOptional()
  @IsString()
  seller?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dealerId?: string;

  @ApiPropertyOptional({ description: 'Alias for dealerId' })
  @IsOptional()
  @IsString()
  dealer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ example: 'IQD', description: 'Filter by primary currency code' })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional({ description: 'Alias for minPrice/maxPrice pair via price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1950)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  plate?: string;

  @ApiPropertyOptional({ enum: ListingCategoryCode })
  @IsOptional()
  @IsEnum(ListingCategoryCode)
  categoryCode?: ListingCategoryCode;

  @ApiPropertyOptional({ description: 'Include soft-deleted listings' })
  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  includeDeleted?: boolean;

  @ApiPropertyOptional({
    enum: ['createdAt', 'updatedAt', 'primaryPrice', 'viewsCount'],
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'primaryPrice', 'viewsCount'])
  sortBy?: 'createdAt' | 'updatedAt' | 'primaryPrice' | 'viewsCount';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  featured?: boolean;
}

export class AdminListingFindQueryDto {
  @ApiPropertyOptional({ description: 'Include soft-deleted listing' })
  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  includeDeleted?: boolean;
}

export class AdminOptionalPlateDetailsDto {
  @ApiPropertyOptional({ example: 'IQ_ERBIL' })
  @IsOptional()
  @IsString()
  formatCode?: string;

  @ApiPropertyOptional({ example: '22 X 99099' })
  @IsOptional()
  @IsString()
  plateDisplay?: string;

  @ApiPropertyOptional({ example: '22X99099' })
  @IsOptional()
  @IsString()
  plateNormalized?: string;

  @ApiPropertyOptional({ example: 'X' })
  @IsOptional()
  @IsString()
  series?: string;

  @ApiPropertyOptional({ example: '99099' })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional({ example: '22' })
  @IsOptional()
  @IsString()
  regionCode?: string;

  @ApiPropertyOptional({ example: 'Private' })
  @IsOptional()
  @IsString()
  plateType?: string;
}

export class AdminUpdateListingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  primaryPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  secondaryPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cityId?: string;

  @ForbidListingStatusOnContentUpdate()
  status?: never;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conditionTypeId?: string;

  @ApiPropertyOptional({ example: 'IQD' })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryCurrencyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => VehicleDetailsDto)
  carDetails?: VehicleDetailsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => AdminOptionalPlateDetailsDto)
  plateDetails?: AdminOptionalPlateDetailsDto;
}

export class AdminCreateListingDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsString()
  categoryId!: string;

  @ApiProperty()
  @IsString()
  cityId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conditionTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  primaryPrice?: number;

  @ApiPropertyOptional({ example: 'IQD' })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryCurrencyId?: string;

  @ApiPropertyOptional({ enum: ListingStatus })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => VehicleDetailsDto)
  carDetails?: VehicleDetailsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => AdminOptionalPlateDetailsDto)
  plateDetails?: AdminOptionalPlateDetailsDto;

  @ApiPropertyOptional({ enum: LanguageCode })
  @IsOptional()
  @IsEnum(LanguageCode)
  language?: LanguageCode;
}

export class AdminBulkListingsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids!: string[];

  @ApiProperty({
    enum: [
      'delete',
      'archive',
      'activate',
      'deactivate',
      'feature',
      'unfeature',
      'restore',
    ],
  })
  @IsIn([
    'delete',
    'archive',
    'activate',
    'deactivate',
    'feature',
    'unfeature',
    'restore',
  ])
  action!:
    | 'delete'
    | 'archive'
    | 'activate'
    | 'deactivate'
    | 'feature'
    | 'unfeature'
    | 'restore';
}

export class AdminPermanentDeleteQueryDto {
  @ApiPropertyOptional({ description: 'Allow hard delete even if not soft-deleted' })
  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  force?: boolean;
}

