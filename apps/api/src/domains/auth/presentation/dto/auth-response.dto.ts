import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@autohub/database';
import { Permission } from '../../domain/permissions';

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

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty({ enum: Permission, isArray: true })
  permissions!: Permission[];

  @ApiProperty()
  status!: string;
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
