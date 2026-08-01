import { ApiProperty } from '@nestjs/swagger';
import { SellerType } from '@autohub/database';

class SellerCityDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nameEn!: string;

  @ApiProperty()
  nameAr!: string;

  @ApiProperty({ nullable: true })
  nameKu!: string | null;

  @ApiProperty()
  governorateId!: string;
}

class SellerGovernorateDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nameEn!: string;

  @ApiProperty()
  nameAr!: string;

  @ApiProperty({ nullable: true })
  nameKu!: string | null;
}

export class SellerProfileResponseDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: SellerType })
  type!: SellerType;

  @ApiProperty()
  displayName!: string;

  @ApiProperty({ nullable: true })
  bio!: string | null;

  @ApiProperty({ nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({ nullable: true })
  firstName!: string | null;

  @ApiProperty({ nullable: true })
  lastName!: string | null;

  @ApiProperty({ type: SellerCityDto, nullable: true })
  city!: SellerCityDto | null;

  @ApiProperty({ type: SellerGovernorateDto, nullable: true })
  governorate!: SellerGovernorateDto | null;
}
