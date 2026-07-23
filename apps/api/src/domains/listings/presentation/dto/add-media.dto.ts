import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AddMediaDto {
  @ApiProperty({
    enum: ['IMAGE', 'VIDEO', '360_MEDIA'],
    description: '360_MEDIA maps to MEDIA_360 in the database',
  })
  @IsString()
  @IsNotEmpty()
  mediaType!: string;

  @ApiProperty({ description: 'Object key in Cloudflare R2' })
  @IsString()
  @IsNotEmpty()
  r2Key!: string;

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
    description:
      'Optional base64 image bytes used to generate a JPEG thumbnail (IMAGE only)',
  })
  @IsOptional()
  @IsString()
  imageBase64?: string;
}
