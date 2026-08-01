import { ApiPropertyOptional } from '@nestjs/swagger';
import { SellerType } from '@autohub/database';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateSellerProfileDto {
  @ApiPropertyOptional({ enum: SellerType })
  @IsOptional()
  @IsEnum(SellerType)
  type?: SellerType;

  @ApiPropertyOptional({ description: 'Public seller display name (2–80).' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName?: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Seller bio. Pass null to clear.',
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(2000)
  bio?: string | null;
}
