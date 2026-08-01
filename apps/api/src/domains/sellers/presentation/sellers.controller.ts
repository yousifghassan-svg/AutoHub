import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Public } from '../../../shared/decorators/public.decorator';
import { Permission } from '../../auth/domain/permissions';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { SellersService } from '../application/sellers.service';
import { UpdateSellerProfileDto } from './dto/update-seller-profile.dto';
import { SellerProfileResponseDto } from './dto/seller-profile-response.dto';

@ApiTags('sellers')
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellers: SellersService) {}

  @Get('me')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.PROFILE_READ)
  @ApiOperation({ summary: 'Get or create own consumer seller profile' })
  getMine(@CurrentUser() user: AuthenticatedUser): Promise<SellerProfileResponseDto> {
    return this.sellers.getMine(user.id);
  }

  @Patch('me')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.PROFILE_WRITE)
  @ApiOperation({ summary: 'Update own consumer seller profile (type, bio, display name)' })
  updateMine(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateSellerProfileDto,
  ): Promise<SellerProfileResponseDto> {
    return this.sellers.updateMine(user.id, body);
  }

  @Public()
  @Get(':userId')
  @ApiOperation({ summary: 'Public consumer seller profile by user id' })
  getPublic(@Param('userId') userId: string): Promise<SellerProfileResponseDto> {
    return this.sellers.getPublicByUserId(userId);
  }
}
