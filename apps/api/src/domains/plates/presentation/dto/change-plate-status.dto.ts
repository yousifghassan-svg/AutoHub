import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ListingStatus } from '@autohub/database';

export class ChangePlateStatusDto {
  @ApiProperty({
    enum: ListingStatus,
    description:
      'Lifecycle: DRAFT → PENDING → ACTIVE → RESERVED → SOLD → ARCHIVED. PENDING → ACTIVE requires moderator/admin.',
  })
  @IsEnum(ListingStatus)
  status!: ListingStatus;
}
