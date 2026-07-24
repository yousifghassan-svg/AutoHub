import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class StaffLoginDto {
  @ApiProperty({
    example: '+9647700090002',
    description: 'Staff phone in E.164 (seed admins: +9647700090001–0005)',
  })
  @IsString()
  @MinLength(8)
  phone!: string;
}
