import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class VehicleDetailsDto {
  @ApiPropertyOptional({ description: 'Make / brand id (alias of brandId)' })
  @IsOptional()
  @IsString()
  makeId?: string;

  @ApiPropertyOptional({ description: 'Brand id (preferred)' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Model id' })
  @IsOptional()
  @IsString()
  modelId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1950)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  mileageKm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fuelTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transmissionTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  driveTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bodyTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  colorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  engineTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  engineSizeCc?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(6)
  doors?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trim?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(9)
  seats?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  interiorColor?: string;
}

/** Maps vehicle-focused DTO fields to listing vehicleDetails input. */
export function toVehicleDetailsInput(dto?: VehicleDetailsDto) {
  if (!dto) return undefined;
  return {
    brandId: dto.brandId ?? dto.makeId,
    modelId: dto.modelId,
    year: dto.year,
    mileageKm: dto.mileageKm,
    fuelTypeId: dto.fuelTypeId,
    transmissionTypeId: dto.transmissionTypeId,
    driveTypeId: dto.driveTypeId,
    bodyTypeId: dto.bodyTypeId,
    colorId: dto.colorId,
    engineTypeId: dto.engineTypeId,
    engineSizeCc: dto.engineSizeCc,
    doors: dto.doors,
    vin: dto.vin,
    trim: dto.trim,
    seats: dto.seats,
    interiorColor: dto.interiorColor,
  };
}
