import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class PlateDetailsDto {
  @ApiProperty({ example: 'IQ_ERBIL' })
  @IsString()
  @IsNotEmpty()
  formatCode!: string;

  @ApiProperty({ example: '22 X 99099' })
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  plateDisplay!: string;

  @ApiPropertyOptional({ example: '22X99099' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  plateNormalized?: string;

  @ApiPropertyOptional({ example: 'X', description: 'Letter / series' })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  series?: string;

  @ApiPropertyOptional({ example: '99099' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  number?: string;

  @ApiPropertyOptional({ example: '22', description: 'Governorate code on the plate' })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  regionCode?: string;

  @ApiPropertyOptional({
    example: 'Private',
    description: 'Private | Taxi | Government | Commercial | Diplomatic',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  plateType?: string;
}
