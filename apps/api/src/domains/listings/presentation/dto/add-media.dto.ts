import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class AddMediaDto {
  @ApiProperty({
    enum: ['IMAGE', 'VIDEO', '360_MEDIA', 'DOCUMENT'],
    description: '360_MEDIA maps to MEDIA_360 in the database',
  })
  @IsString()
  @IsNotEmpty()
  mediaType!: string;

  @ApiPropertyOptional({
    description:
      'Platform MediaAsset id — when set, r2Key/thumb/mime are pulled from the asset',
  })
  @IsOptional()
  @IsString()
  mediaAssetId?: string;

  @ApiPropertyOptional({ description: 'Object key in Cloudflare R2 (required if no mediaAssetId)' })
  @ValidateIf((o: AddMediaDto) => !o.mediaAssetId)
  @IsString()
  @IsNotEmpty()
  r2Key?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  byteSize?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  confirmed?: boolean;

  @ApiPropertyOptional({
    enum: ['REGISTRATION', 'INSPECTION', 'OWNERSHIP', 'OTHER'],
    description: 'Document purpose when mediaType is DOCUMENT',
  })
  @IsOptional()
  @IsString()
  documentPurpose?: string;

  @ApiPropertyOptional({
    description:
      'Optional base64 image bytes used to generate a JPEG thumbnail (IMAGE only)',
  })
  @IsOptional()
  @IsString()
  imageBase64?: string;
}
