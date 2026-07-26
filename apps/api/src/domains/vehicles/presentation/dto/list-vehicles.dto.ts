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
import { ListingCategoryCode, ListingStatus } from '@autohub/database';

export class ListVehiclesDto {
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

  @ApiPropertyOptional({ enum: ['createdAt', 'primaryPrice', 'publishedAt'] })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'primaryPrice' | 'publishedAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  governorateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ListingCategoryCode })
  @IsOptional()
  @IsEnum(ListingCategoryCode)
  categoryCode?: ListingCategoryCode;

  @ApiPropertyOptional({ description: 'Make / brand id' })
  @IsOptional()
  @IsString()
  makeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modelId?: string;

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

  @ApiPropertyOptional({ enum: ListingStatus })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    return value === 'true' || value === '1';
  })
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: 'When true, return only the current user vehicles' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  mine?: boolean;
}

export function mapListVehiclesDto(dto: ListVehiclesDto) {
  return {
    page: dto.page,
    pageSize: dto.pageSize,
    sortBy: dto.sortBy,
    sortOrder: dto.sortOrder,
    cityId: dto.cityId,
    governorateId: dto.governorateId,
    categoryId: dto.categoryId,
    categoryCode: dto.categoryCode,
    brandId: dto.makeId,
    modelId: dto.modelId,
    minPrice: dto.minPrice,
    maxPrice: dto.maxPrice,
    currencyCode: dto.currencyCode,
    status: dto.status,
    isFeatured: dto.isFeatured,
    keyword: dto.keyword,
    mine: dto.mine,
  };
}
