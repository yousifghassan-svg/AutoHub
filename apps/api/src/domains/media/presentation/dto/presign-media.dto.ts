import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MediaVisibility } from '@autohub/database';

export class PresignMediaDto {
  @ApiProperty({ enum: ['IMAGE', 'VIDEO', 'MEDIA_360', 'DOCUMENT', '360_MEDIA'] })
  @IsString()
  @IsNotEmpty()
  mediaType!: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @ApiProperty({ description: 'Declared upload size in bytes' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  byteSize!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional({ enum: MediaVisibility, default: MediaVisibility.PRIVATE })
  @IsOptional()
  @IsEnum(MediaVisibility)
  visibility?: MediaVisibility;

  @ApiPropertyOptional({ description: 'Owning domain module, e.g. listings' })
  @IsOptional()
  @IsString()
  ownerModule?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerEntityId?: string;

  @ApiPropertyOptional({
    enum: ['REGISTRATION', 'INSPECTION', 'OWNERSHIP', 'OTHER'],
    description: 'Required context for DOCUMENT media',
  })
  @IsOptional()
  @IsString()
  documentPurpose?: string;
}
