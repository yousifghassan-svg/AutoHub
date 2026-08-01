import { ApiProperty } from '@nestjs/swagger';
import { LanguageCode, SellerType, UserRole } from '@autohub/database';
import { Permission } from '../../domain/permissions';

export class AuthenticatedUserCityDto {
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

export class AuthenticatedUserGovernorateDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nameEn!: string;

  @ApiProperty()
  nameAr!: string;

  @ApiProperty({ nullable: true })
  nameKu!: string | null;
}

export class AuthenticatedSellerProfileDto {
  @ApiProperty({ enum: SellerType })
  type!: SellerType;

  @ApiProperty()
  displayName!: string;

  @ApiProperty({ nullable: true })
  bio!: string | null;
}

export class NotificationPreferencesDto {
  @ApiProperty()
  pushEnabled!: boolean;

  @ApiProperty()
  emailEnabled!: boolean;

  @ApiProperty()
  smsEnabled!: boolean;

  @ApiProperty()
  newMessage!: boolean;

  @ApiProperty()
  listingApproved!: boolean;

  @ApiProperty()
  listingRejected!: boolean;

  @ApiProperty()
  priceChange!: boolean;

  @ApiProperty()
  favouriteUpdate!: boolean;

  @ApiProperty()
  dealerReply!: boolean;

  @ApiProperty()
  system!: boolean;
}

export class AuthenticatedUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  firebaseUid!: string | null;

  @ApiProperty({ nullable: true })
  phone!: string | null;

  @ApiProperty({ nullable: true })
  email!: string | null;

  @ApiProperty({ nullable: true })
  displayName!: string | null;

  @ApiProperty({ nullable: true })
  firstName!: string | null;

  @ApiProperty({ nullable: true })
  lastName!: string | null;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty({ enum: Permission, isArray: true })
  permissions!: Permission[];

  @ApiProperty()
  status!: string;

  @ApiProperty({ enum: LanguageCode, nullable: true })
  preferredLanguage!: LanguageCode | null;

  @ApiProperty({ nullable: true })
  cityId!: string | null;

  @ApiProperty({ type: AuthenticatedUserCityDto, nullable: true })
  city!: AuthenticatedUserCityDto | null;

  @ApiProperty({ type: AuthenticatedUserGovernorateDto, nullable: true })
  governorate!: AuthenticatedUserGovernorateDto | null;

  @ApiProperty({ nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({ nullable: true })
  avatarMediaId!: string | null;

  @ApiProperty({
    nullable: true,
    description: 'ISO date YYYY-MM-DD',
  })
  dateOfBirth!: string | null;

  @ApiProperty({
    enum: ['unauthenticated', 'needs_profile', 'authenticated'],
    description:
      'Client auth gate. /auth/me returns needs_profile | authenticated; unauthenticated is client-only (no session).',
  })
  identityStatus!: 'unauthenticated' | 'needs_profile' | 'authenticated';

  @ApiProperty({
    description: '0–100 profile completeness across required and optional fields.',
    minimum: 0,
    maximum: 100,
  })
  profileCompletionPercent!: number;

  @ApiProperty({ type: AuthenticatedSellerProfileDto, nullable: true })
  sellerProfile!: AuthenticatedSellerProfileDto | null;

  @ApiProperty({ type: NotificationPreferencesDto })
  notificationPreferences!: NotificationPreferencesDto;
}

export class AuthTokensDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: 'Bearer';

  @ApiProperty({ description: 'Access token TTL in seconds' })
  expiresIn!: number;

  @ApiProperty({ type: AuthenticatedUserDto })
  user!: AuthenticatedUserDto;
}
