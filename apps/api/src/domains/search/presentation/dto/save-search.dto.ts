import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { SearchSort } from '../../domain/search.types';

export class SaveSearchDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({
    description: 'Persisted filter snapshot (same shape as GET /search query params)',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  filters!: Record<string, unknown>;

  @ApiPropertyOptional({ enum: SearchSort })
  @IsOptional()
  @IsEnum(SearchSort)
  sort?: SearchSort;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  notify?: boolean;
}
