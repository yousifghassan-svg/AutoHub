import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { LanguageCode } from '@autohub/database';
import { VehicleDetailsDto, toVehicleDetailsInput } from './vehicle-details.dto';

export class CreateVehicleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cityId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conditionTypeId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description!: string;

  @ApiPropertyOptional({ enum: LanguageCode, default: LanguageCode.ar })
  @IsOptional()
  language?: LanguageCode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiProperty({ description: 'Listing price (required)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  primaryPrice!: number;

  @ApiPropertyOptional({ example: 'IQD', default: 'IQD' })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryCurrencyId?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  secondaryPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secondaryCurrencyId?: string;

  @ApiPropertyOptional({ type: VehicleDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => VehicleDetailsDto)
  vehicleDetails?: VehicleDetailsDto;
}

export function mapCreateVehicleDto(dto: CreateVehicleDto) {
  return {
    categoryId: dto.categoryId,
    cityId: dto.cityId,
    countryId: dto.countryId,
    conditionTypeId: dto.conditionTypeId,
    title: dto.title,
    description: dto.description,
    language: dto.language,
    slug: dto.slug,
    metaTitle: dto.metaTitle,
    metaDescription: dto.metaDescription,
    primaryPrice: dto.primaryPrice,
    currencyCode: dto.currencyCode,
    primaryCurrencyId: dto.primaryCurrencyId,
    secondaryPrice: dto.secondaryPrice,
    secondaryCurrencyId: dto.secondaryCurrencyId,
    vehicleDetails: toVehicleDetailsInput(dto.vehicleDetails),
  };
}
