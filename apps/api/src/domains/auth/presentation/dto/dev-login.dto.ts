import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class DevLoginDto {
  @ApiProperty({
    example: '+9647700010006',
    description:
      'Any E.164 phone. Non-production only (same gate as staff-login). Finds or creates a USER for local RC.',
  })
  @IsString()
  @MinLength(8)
  phone!: string;
}
