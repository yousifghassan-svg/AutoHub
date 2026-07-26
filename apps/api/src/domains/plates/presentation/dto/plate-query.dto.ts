import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ListingStatus, PlateVerificationStatus } from '@autohub/database';

export class PlatePaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

export class PlateSearchQueryDto extends PlatePaginationDto {
  @ApiPropertyOptional({ enum: ['createdAt', 'primaryPrice', 'publishedAt'] })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'primaryPrice' | 'publishedAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Governorate id' })
  @IsOptional()
  @IsString()
  governorateId?: string;

  @ApiPropertyOptional({ description: 'Province / governorate name or code' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: 'Plate format code, e.g. IQ_ERBIL' })
  @IsOptional()
  @IsString()
  formatCode?: string;

  @ApiPropertyOptional({ description: 'Letter / series prefix' })
  @IsOptional()
  @IsString()
  prefix?: string;

  @ApiPropertyOptional({ description: 'Letter / series' })
  @IsOptional()
  @IsString()
  series?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional({ description: 'Exact digit count in plate number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8)
  digits?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ example: 'IQD' })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  plateCategoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  platePrefixId?: string;

  @ApiPropertyOptional({ enum: PlateVerificationStatus })
  @IsOptional()
  @IsEnum(PlateVerificationStatus)
  verificationStatus?: PlateVerificationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyword?: string;
}

export class PlatesQueryDto extends PlateSearchQueryDto {
  @ApiPropertyOptional({ enum: ListingStatus })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @ApiPropertyOptional({ description: 'Return only the current user plate listings' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  mine?: boolean;
}

export class PlatePrefixQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  formatCode?: string;
}
