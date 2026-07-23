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
import { VehicleDetailsDto } from './vehicle-details.dto';

export class CreateListingDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  primaryPrice?: number;

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
  carDetails?: VehicleDetailsDto;

  @ApiPropertyOptional({ type: VehicleDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => VehicleDetailsDto)
  vehicleDetails?: VehicleDetailsDto;
}
