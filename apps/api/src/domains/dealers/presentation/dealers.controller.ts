import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Public } from '../../../shared/decorators/public.decorator';
import { Permission } from '../../auth/domain/permissions';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { PublicDealersService } from '../application/public-dealers.service';
import { DealerAccountsService } from '../application/dealer-accounts.service';
import { DealersQueryDto } from './dto/dealers-query.dto';
import {
  AddDealerMemberDto,
  ApplyDealerDto,
  DealerInventoryQueryDto,
  UpdateDealerMemberDto,
  UpdateDealerOrgDto,
} from './dto/dealer-accounts.dto';

@ApiTags('dealers')
@Controller('dealers')
export class DealersController {
  constructor(
    private readonly dealers: PublicDealersService,
    private readonly accounts: DealerAccountsService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List dealer organizations' })
  list(@Query() query: DealersQueryDto) {
    return this.dealers.list(query);
  }

  @Post('applications')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.DEALERS_APPLY)
  @ApiOperation({ summary: 'Apply as dealer (creates org + OWNER, PENDING)' })
  apply(@CurrentUser() user: AuthenticatedUser, @Body() body: ApplyDealerDto) {
    return this.accounts.apply(user.id, body);
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.DEALERS_ORG_READ)
  @ApiOperation({ summary: 'Get own dealer organization membership' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.accounts.getMe(user.id);
  }

  @Patch('me')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.DEALERS_ORG_WRITE)
  @ApiOperation({ summary: 'Update own dealer organization profile' })
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() body: UpdateDealerOrgDto) {
    return this.accounts.updateMe(user.id, body);
  }

  @Post('me/reapply')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.DEALERS_APPLY)
  @ApiOperation({ summary: 'Reapply after rejection (REJECTED → PENDING)' })
  reapply(@CurrentUser() user: AuthenticatedUser) {
    return this.accounts.reapply(user.id);
  }

  @Get('me/members')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.DEALERS_ORG_READ)
  @ApiOperation({ summary: 'List organization members' })
  members(@CurrentUser() user: AuthenticatedUser) {
    return this.accounts.listMembers(user.id);
  }

  @Post('me/members')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.DEALERS_MEMBERS_MANAGE)
  @ApiOperation({ summary: 'Add organization member by userId or phone' })
  addMember(@CurrentUser() user: AuthenticatedUser, @Body() body: AddDealerMemberDto) {
    return this.accounts.addMember(user.id, body);
  }

  @Patch('me/members/:userId')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.DEALERS_MEMBERS_MANAGE)
  @ApiOperation({ summary: 'Update member role (OWNER only)' })
  updateMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() body: UpdateDealerMemberDto,
  ) {
    return this.accounts.updateMemberRole(user.id, userId, body.role);
  }

  @Delete('me/members/:userId')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.DEALERS_MEMBERS_MANAGE)
  @ApiOperation({ summary: 'Remove organization member' })
  removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
  ) {
    return this.accounts.removeMember(user.id, userId);
  }

  @Get('me/stats')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.DEALERS_ORG_READ)
  @ApiOperation({ summary: 'Dealer dashboard statistics' })
  stats(@CurrentUser() user: AuthenticatedUser) {
    return this.accounts.getStats(user.id);
  }

  @Get('me/inventory')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.DEALERS_ORG_READ)
  @ApiOperation({ summary: 'Member-derived organization inventory' })
  inventory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: DealerInventoryQueryDto,
  ) {
    return this.accounts.getInventory(user.id, query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get dealer profile, statistics, and inventory' })
  findBySlug(@Param('slug') slug: string) {
    return this.dealers.getBySlug(slug);
  }
}
