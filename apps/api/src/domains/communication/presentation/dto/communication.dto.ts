import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ChatMessageType, ReportReason } from '@autohub/database';

export class FirstMessageDto {
  @ApiProperty({ enum: ChatMessageType })
  @IsEnum(ChatMessageType)
  type!: ChatMessageType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Client idempotency key' })
  @IsOptional()
  @IsString()
  clientId?: string;
}

export class StartListingConversationDto {
  @ApiProperty()
  @IsString()
  listingId!: string;

  @ApiPropertyOptional({ type: FirstMessageDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FirstMessageDto)
  firstMessage?: FirstMessageDto;
}

export class StartDealerConversationDto {
  @ApiProperty()
  @IsString()
  organizationId!: string;

  @ApiPropertyOptional({ type: FirstMessageDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FirstMessageDto)
  firstMessage?: FirstMessageDto;
}

export class InboxQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  unreadOnly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === true || value === 'true' || value === '1';
  })
  @IsBoolean()
  archived?: boolean;

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
  @Max(50)
  pageSize?: number = 20;
}

export class UpdateConversationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  archive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  unarchive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  mutedUntil?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  unmute?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hide?: boolean;
}

export class SendMessageDto {
  @ApiProperty({ enum: ChatMessageType })
  @IsEnum(ChatMessageType)
  type!: ChatMessageType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientId?: string;
}

export class MessagesQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 30;

  @ApiPropertyOptional({ description: 'ISO cursor — messages before this time' })
  @IsOptional()
  @IsDateString()
  before?: string;

  @ApiPropertyOptional({ description: 'ISO cursor — messages after this time' })
  @IsOptional()
  @IsDateString()
  after?: string;
}

export class TypingDto {
  @ApiProperty({ default: true })
  @IsBoolean()
  typing!: boolean;
}

export class ReportConversationDto {
  @ApiProperty({ enum: ReportReason })
  @IsEnum(ReportReason)
  reason!: ReportReason;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  details?: string;
}

export class BlockUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
