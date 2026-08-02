import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
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

  @ApiPropertyOptional({
    description: 'DRAFT autosave allows short titles; completeness enforced on submit',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'DRAFT autosave allows short descriptions; completeness enforced on submit',
  })
  @IsOptional()
  @IsString()
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

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  features?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  draftStep?: string | null;

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
    features: dto.features,
    draftStep: dto.draftStep,
    vehicleDetails: toVehicleDetailsInput(dto.vehicleDetails),
  };
}
