import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PushPlatform } from '@autohub/database';

export class NotificationsQueryDto {
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
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  unreadOnly?: boolean;
}

export class RegisterDeviceDto {
  @ApiProperty()
  @IsString()
  token!: string;

  @ApiPropertyOptional({ enum: PushPlatform, default: PushPlatform.EXPO })
  @IsOptional()
  @IsEnum(PushPlatform)
  platform?: PushPlatform = PushPlatform.EXPO;
}

export class UnregisterDeviceDto {
  @ApiProperty()
  @IsString()
  token!: string;
}

export class MarkNotificationReadDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  all?: boolean;
}
