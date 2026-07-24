import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class ContactClickDto {
  @ApiProperty({ enum: ['phone', 'whatsapp'] })
  @IsString()
  @IsIn(['phone', 'whatsapp'])
  channel!: 'phone' | 'whatsapp';
}
