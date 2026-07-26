import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ListVehiclesDto, mapListVehiclesDto } from './list-vehicles.dto';

export class SearchVehiclesDto extends ListVehiclesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1950)
  @Max(2100)
  minYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1950)
  @Max(2100)
  maxYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minMileage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxMileage?: number;

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
  bodyTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  driveTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  colorId?: string;
}

export function mapSearchVehiclesDto(dto: SearchVehiclesDto) {
  return {
    ...mapListVehiclesDto(dto),
    minYear: dto.minYear,
    maxYear: dto.maxYear,
    minMileage: dto.minMileage,
    maxMileage: dto.maxMileage,
    fuelTypeId: dto.fuelTypeId,
    transmissionTypeId: dto.transmissionTypeId,
    bodyTypeId: dto.bodyTypeId,
    driveTypeId: dto.driveTypeId,
    colorId: dto.colorId,
  };
}
