import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListingStatus } from '@autohub/database';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdatePlateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  description?: string;

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

  @ApiPropertyOptional({ enum: ListingStatus })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;
}
