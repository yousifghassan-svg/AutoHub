import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

function toBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return undefined;
}

export class ListMediaDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mediaType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}

export class AdminListMediaDto extends ListMediaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter assets with no ownerEntityId (unattached)',
  })
  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  unused?: boolean;

  @ApiPropertyOptional({
    description: 'Only assets whose checksumSha256 appears more than once',
  })
  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  duplicates?: boolean;

  @ApiPropertyOptional({ description: 'Include soft-deleted assets' })
  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  includeDeleted?: boolean;
}
