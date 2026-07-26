import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LanguageCode } from '@autohub/database';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePlateDto {
  @ApiProperty()
  @IsString()
  categoryId!: string;

  @ApiProperty()
  @IsString()
  cityId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  description!: string;

  @ApiPropertyOptional({ enum: LanguageCode })
  @IsOptional()
  @IsEnum(LanguageCode)
  language?: LanguageCode;

  @ApiProperty({ description: 'Listing price (required)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  primaryPrice!: number;

  @ApiPropertyOptional({ example: 'IQD', default: 'IQD' })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryCurrencyId?: string;
  @ApiProperty({ example: 'IQ_ERBIL' })
  @IsString()
  @IsNotEmpty()
  formatCode!: string;

  @ApiProperty({ description: 'Governorate / region code on the plate' })
  @IsString()
  @IsNotEmpty()
  regionCode!: string;

  @ApiProperty({ description: 'Plate letter / series' })
  @IsString()
  @IsNotEmpty()
  series!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  number!: string;

  @ApiPropertyOptional({ example: 'Private' })
  @IsOptional()
  @IsString()
  plateType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  plateCategoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  platePrefixId?: string;
}
