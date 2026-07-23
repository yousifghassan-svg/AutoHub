import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class LogoutDto {
  @ApiPropertyOptional({
    description: 'Refresh token to revoke. If omitted, all sessions for the user are revoked.',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiPropertyOptional({
    description: 'When true, revoke all refresh tokens for the user',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  revokeAll?: boolean;
}
