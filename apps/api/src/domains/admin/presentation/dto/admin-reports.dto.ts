import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportReason, ReportStatus } from '@autohub/database';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AdminPaginationDto } from './admin-common.dto';

export class AdminReportsQueryDto extends AdminPaginationDto {
  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;
}

export class CreateListingReportDto {
  @ApiProperty()
  @IsString()
  listingId!: string;

  @ApiProperty({ enum: ReportReason })
  @IsEnum(ReportReason)
  reason!: ReportReason;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  details?: string;
}

export class ResolveReportDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolution?: string;
}
