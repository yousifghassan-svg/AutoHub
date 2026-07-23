import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CompleteMediaDto {
  @ApiProperty({ description: 'Media asset id returned by /media/presign' })
  @IsString()
  @IsNotEmpty()
  mediaId!: string;

  @ApiPropertyOptional({
    description: 'Optional base64 file bytes when R2 pull is unavailable',
  })
  @IsOptional()
  @IsString()
  fileBase64?: string;

  @ApiPropertyOptional({ description: 'Optional video duration override (seconds)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  durationSeconds?: number;
}
