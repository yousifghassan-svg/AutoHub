import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class AdminStatsQueryDto {
  @ApiPropertyOptional({ enum: ['daily', 'weekly', 'monthly'], default: 'monthly' })
  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly'])
  range?: 'daily' | 'weekly' | 'monthly' = 'monthly';
}
