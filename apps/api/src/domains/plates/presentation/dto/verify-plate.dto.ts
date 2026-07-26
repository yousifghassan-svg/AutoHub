import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlateVerificationStatus } from '@autohub/database';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class VerifyPlateDto {
  @ApiProperty({ enum: PlateVerificationStatus })
  @IsEnum(PlateVerificationStatus)
  status!: PlateVerificationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class AdminPlateCategoryDto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty()
  @IsString()
  nameEn!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  active?: boolean;
}

export class AdminPlatePrefixDto {
  @ApiProperty()
  @IsString()
  formatCode!: string;

  @ApiProperty()
  @IsString()
  letter!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  active?: boolean;
}

export class AdminVerificationsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  listingId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
