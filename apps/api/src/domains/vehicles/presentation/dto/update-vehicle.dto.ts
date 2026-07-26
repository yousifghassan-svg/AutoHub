import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { LanguageCode } from '@autohub/database';
import { VehicleDetailsDto, toVehicleDetailsInput } from './vehicle-details.dto';

export class UpdateVehicleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conditionTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiPropertyOptional({ enum: LanguageCode })
  @IsOptional()
  language?: LanguageCode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
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
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  secondaryPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secondaryCurrencyId?: string;

  @ApiPropertyOptional({ description: 'Moderator/admin only' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ type: VehicleDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => VehicleDetailsDto)
  vehicleDetails?: VehicleDetailsDto;
}

export function mapUpdateVehicleDto(dto: UpdateVehicleDto) {
  return {
    cityId: dto.cityId,
    countryId: dto.countryId,
    conditionTypeId: dto.conditionTypeId,
    title: dto.title,
    description: dto.description,
    language: dto.language,
    metaTitle: dto.metaTitle,
    metaDescription: dto.metaDescription,
    primaryPrice: dto.primaryPrice,
    currencyCode: dto.currencyCode,
    primaryCurrencyId: dto.primaryCurrencyId,
    secondaryPrice: dto.secondaryPrice,
    secondaryCurrencyId: dto.secondaryCurrencyId,
    isFeatured: dto.isFeatured,
    vehicleDetails: toVehicleDetailsInput(dto.vehicleDetails),
  };
}
