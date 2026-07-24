import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class VehicleDetailsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional()
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
