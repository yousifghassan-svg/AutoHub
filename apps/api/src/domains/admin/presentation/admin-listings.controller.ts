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
import { AdminListingsService } from '../application/admin-listings.service';
import { adminRequestContext } from './admin-request.util';
import {
  AdminBulkListingsDto,
  AdminCreateListingDto,
  AdminListingFindQueryDto,
  AdminListingsQueryDto,
  AdminPermanentDeleteQueryDto,
  AdminUpdateListingDto,
} from './dto/admin-listings.dto';

@ApiTags('admin-listings')
@ApiBearerAuth('access-token')
@Controller('admin/listings')
export class AdminListingsController {
  constructor(private readonly listings: AdminListingsService) {}

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_READ)
  @ApiOperation({ summary: 'Export filtered listings as CSV' })
  export(@Query() query: AdminListingsQueryDto): Promise<string> {
    return this.listings.exportCsv(this.toQuery(query));
  }

  @Post('bulk')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Bulk listing actions' })
  bulk(
    @Body() body: AdminBulkListingsDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.listings.bulk(body.ids, body.action, user, adminRequestContext(req));
  }

  @Post()
  @Permissions(Permission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Create listing (admin)' })
  create(
    @Body() body: AdminCreateListingDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    this.assertCanCreateListing(user);
    return this.listings.create(user, body, adminRequestContext(req));
  }

  @Get()
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_READ)
  @ApiOperation({ summary: 'List/filter all listings (admin)' })
  list(@Query() query: AdminListingsQueryDto): Promise<unknown> {
    return this.listings.list(this.toQuery(query));
  }

  @Get(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_READ)
  @ApiOperation({ summary: 'Get listing by id (admin)' })
  findOne(
    @Param('id') id: string,
    @Query() query: AdminListingFindQueryDto,
  ): Promise<unknown> {
    return this.listings.findById(id, { includeDeleted: query.includeDeleted });
  }

  @Patch(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Update listing (admin)' })
  update(
    @Param('id') id: string,
    @Body() body: AdminUpdateListingDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.listings.update(id, body, user, adminRequestContext(req));
  }

  @Delete(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_DELETE)
  @ApiOperation({ summary: 'Soft-delete listing (admin)' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.listings.softDelete(id, user, adminRequestContext(req));
  }

  @Post(':id/restore')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Restore soft-deleted listing' })
  restore(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.listings.restore(id, user, adminRequestContext(req));
  }

  @Delete(':id/permanent')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_DELETE)
  @ApiOperation({ summary: 'Permanently delete listing' })
  permanentDelete(
    @Param('id') id: string,
    @Query() query: AdminPermanentDeleteQueryDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    const ctx = adminRequestContext(req);
    return this.listings.permanentDelete(id, user, {
      force: query.force,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
  }

  @Post(':id/duplicate')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_CREATE)
  @ApiOperation({ summary: 'Duplicate listing as a new DRAFT' })
  duplicate(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.listings.duplicate(id, user, adminRequestContext(req));
  }

  @Post(':id/approve')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Approve listing → ACTIVE' })
  approve(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.listings.approve(id, user, adminRequestContext(req));
  }

  @Post(':id/publish')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Publish listing → ACTIVE' })
  publish(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.listings.publish(id, user, adminRequestContext(req));
  }

  @Post(':id/unpublish')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Unpublish listing → ARCHIVED' })
  unpublish(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.listings.unpublish(id, user, adminRequestContext(req));
  }

  @Post(':id/reject')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Reject listing → REJECTED' })
  reject(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.listings.reject(id, user, adminRequestContext(req));
  }

  @Post(':id/archive')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Archive listing' })
  archive(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.listings.archive(id, user, adminRequestContext(req));
  }

  @Post(':id/feature')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Feature listing' })
  feature(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.listings.feature(id, user, adminRequestContext(req));
  }

  @Post(':id/unfeature')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Unfeature listing' })
  unfeature(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.listings.unfeature(id, user, adminRequestContext(req));
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
      year: query.year,
      plate: query.plate,
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
