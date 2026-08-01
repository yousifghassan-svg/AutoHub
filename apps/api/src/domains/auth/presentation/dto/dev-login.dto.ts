import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class DevLoginDto {
  @ApiProperty({
    example: '+9647700010006',
    description:
      'Any E.164 phone. Development/staging only (AUTH_ALLOW_DEV_LOGIN). Always disabled in production. Finds or creates a USER.',
  })
  @IsString()
  @MinLength(8)
  phone!: string;
}
