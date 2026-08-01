import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ListingStatus } from '@autohub/database';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ForbidListingStatusOnContentUpdate } from '../../../../shared/validators/forbid-listing-status-on-content-update';
import { AdminPaginationDto } from './admin-common.dto';

export class AdminPlatesQueryDto extends AdminPaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  governorate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  letter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  plateType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  formatCode?: string;

  @ApiPropertyOptional({ enum: ListingStatus })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;
}

export class AdminCreatePlateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  listingId?: string;

  @ApiProperty()
  @IsString()
  sellerId!: string;

  @ApiProperty()
  @IsString()
  cityId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryId?: string;

  @ApiProperty()
  @IsString()
  categoryId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  primaryPrice?: number;

  @ApiProperty()
  @IsString()
  formatCode!: string;

  @ApiProperty({ description: 'Governorate / region code' })
  @IsString()
  regionCode!: string;

  @ApiProperty({ description: 'Plate letter / series' })
  @IsString()
  series!: string;

  @ApiProperty()
  @IsString()
  number!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  plateType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  plateCategoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  platePrefixId?: string;

  @ApiPropertyOptional({ enum: ListingStatus })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;
}

export class AdminUpdatePlateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cityId?: string;

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
  @IsString()
  formatCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  regionCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  series?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  plateType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  plateCategoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  platePrefixId?: string;

  @ForbidListingStatusOnContentUpdate()
  status?: never;
}
