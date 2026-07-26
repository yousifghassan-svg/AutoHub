import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permissions';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { AdminVehiclesService } from '../application/admin-vehicles.service';
import { adminRequestContext } from './admin-request.util';
import {
  AdminBulkListingsDto,
  AdminCreateListingDto,
  AdminListingFindQueryDto,
  AdminListingsQueryDto,
  AdminPermanentDeleteQueryDto,
  AdminUpdateListingDto,
} from './dto/admin-listings.dto';

@ApiTags('admin-vehicles')
@ApiBearerAuth('access-token')
@Controller('admin/vehicles')
export class AdminVehiclesController {
  constructor(private readonly vehicles: AdminVehiclesService) {}

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_READ)
  @ApiOperation({ summary: 'Export filtered vehicle listings as CSV' })
  export(@Query() query: AdminListingsQueryDto): Promise<string> {
    return this.vehicles.exportCsv(this.toQuery(query));
  }

  @Post('bulk')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Bulk vehicle listing actions' })
  bulk(
    @Body() body: AdminBulkListingsDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.vehicles.bulk(body.ids, body.action, user, adminRequestContext(req));
  }

  @Post()
  @Permissions(Permission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Create vehicle listing (admin)' })
  create(
    @Body() body: AdminCreateListingDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    this.assertCanCreateListing(user);
    return this.vehicles.create(user, body, adminRequestContext(req));
  }

  @Get()
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_READ)
  @ApiOperation({ summary: 'List/filter vehicle listings (admin)' })
  list(@Query() query: AdminListingsQueryDto): Promise<unknown> {
    return this.vehicles.list(this.toQuery(query));
  }

  @Get(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_READ)
  @ApiOperation({ summary: 'Get vehicle listing by id (admin)' })
  findOne(
    @Param('id') id: string,
    @Query() query: AdminListingFindQueryDto,
  ): Promise<unknown> {
    return this.vehicles.findById(id, { includeDeleted: query.includeDeleted });
  }

  @Patch(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Update vehicle listing (admin)' })
  update(
    @Param('id') id: string,
    @Body() body: AdminUpdateListingDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.vehicles.update(id, body, user, adminRequestContext(req));
  }

  @Delete(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_DELETE)
  @ApiOperation({ summary: 'Soft-delete vehicle listing (admin)' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.vehicles.softDelete(id, user, adminRequestContext(req));
  }

  @Post(':id/restore')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Restore soft-deleted vehicle listing' })
  restore(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.vehicles.restore(id, user, adminRequestContext(req));
  }

  @Delete(':id/permanent')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_DELETE)
  @ApiOperation({ summary: 'Permanently delete vehicle listing' })
  permanentDelete(
    @Param('id') id: string,
    @Query() query: AdminPermanentDeleteQueryDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    const ctx = adminRequestContext(req);
    return this.vehicles.permanentDelete(id, user, {
      force: query.force,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
  }

  @Post(':id/duplicate')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_CREATE)
  @ApiOperation({ summary: 'Duplicate vehicle listing as a new DRAFT' })
  duplicate(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.vehicles.duplicate(id, user, adminRequestContext(req));
  }

  @Post(':id/approve')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Approve vehicle listing → ACTIVE' })
  approve(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.vehicles.approve(id, user, adminRequestContext(req));
  }

  @Post(':id/publish')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Publish vehicle listing → ACTIVE' })
  publish(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.vehicles.publish(id, user, adminRequestContext(req));
  }

  @Post(':id/unpublish')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Unpublish vehicle listing → ARCHIVED' })
  unpublish(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.vehicles.unpublish(id, user, adminRequestContext(req));
  }

  @Post(':id/reject')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Reject vehicle listing → REJECTED' })
  reject(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.vehicles.reject(id, user, adminRequestContext(req));
  }

  @Post(':id/archive')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Archive vehicle listing' })
  archive(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.vehicles.archive(id, user, adminRequestContext(req));
  }

  @Post(':id/feature')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Feature vehicle listing' })
  feature(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.vehicles.feature(id, user, adminRequestContext(req));
  }

  @Post(':id/unfeature')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Unfeature vehicle listing' })
  unfeature(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.vehicles.unfeature(id, user, adminRequestContext(req));
  }

  private toQuery(query: AdminListingsQueryDto) {
    return {
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      cityId: query.cityId ?? query.city,
      brandId: query.brandId ?? query.brand,
      modelId: query.modelId ?? query.model,
      status: query.status,
      sellerId: query.sellerId ?? query.seller,
      dealerId: query.dealerId ?? query.dealer,
      minPrice: query.minPrice ?? query.price,
      maxPrice: query.maxPrice ?? query.price,
      currencyCode: query.currencyCode,
      year: query.year,
      categoryCode: query.categoryCode,
      includeDeleted: query.includeDeleted,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      featured: query.featured,
    };
  }

  private assertCanCreateListing(user: AuthenticatedUser) {
    if (user.role === 'SUPER_ADMIN') return;
    const allowed =
      user.permissions.includes(Permission.LISTINGS_CREATE) ||
      user.permissions.includes(Permission.LISTINGS_MODERATE);
    if (!allowed) {
      throw new ForbiddenException('Insufficient permissions to create listings');
    }
  }
}
