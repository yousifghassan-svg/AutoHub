import {
  Body,
  Controller,
  Delete,
  Get,
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
import { PlateCatalogService } from '../../plates/application/plate-catalog.service';
import { AdminPlatesService } from '../application/admin-plates.service';
import { adminRequestContext } from './admin-request.util';
import {
  AdminCreatePlateDto,
  AdminPlatesQueryDto,
  AdminUpdatePlateDto,
} from './dto/admin-plates.dto';
import {
  AdminPlateCategoryDto,
  AdminPlatePrefixDto,
  AdminVerificationsQueryDto,
} from '../../plates/presentation/dto/verify-plate.dto';

@ApiTags('admin-plates')
@ApiBearerAuth('access-token')
@Controller('admin/plates')
export class AdminPlatesController {
  constructor(
    private readonly plates: AdminPlatesService,
    private readonly catalog: PlateCatalogService,
  ) {}

  @Get('catalog/categories')
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_READ)
  @ApiOperation({ summary: 'List plate categories (admin)' })
  listCategories() {
    return this.catalog.listAllCategories(true);
  }

  @Post('catalog/categories')
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_WRITE)
  @ApiOperation({ summary: 'Create plate category' })
  createCategory(@Body() body: AdminPlateCategoryDto) {
    return this.catalog.createCategory(body);
  }

  @Patch('catalog/categories/:categoryId')
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_WRITE)
  @ApiOperation({ summary: 'Update plate category' })
  updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() body: AdminPlateCategoryDto,
  ) {
    return this.catalog.updateCategory(categoryId, body);
  }

  @Delete('catalog/categories/:categoryId')
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_WRITE)
  @ApiOperation({ summary: 'Soft-delete plate category' })
  removeCategory(@Param('categoryId') categoryId: string) {
    return this.catalog.removeCategory(categoryId);
  }

  @Get('catalog/prefixes')
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_READ)
  @ApiOperation({ summary: 'List plate prefixes (admin)' })
  listPrefixes(@Query('formatCode') formatCode?: string) {
    return this.catalog.listAllPrefixes(formatCode, true);
  }

  @Post('catalog/prefixes')
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_WRITE)
  @ApiOperation({ summary: 'Create plate prefix' })
  createPrefix(@Body() body: AdminPlatePrefixDto) {
    return this.catalog.createPrefix(body);
  }

  @Patch('catalog/prefixes/:prefixId')
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_WRITE)
  @ApiOperation({ summary: 'Update plate prefix' })
  updatePrefix(
    @Param('prefixId') prefixId: string,
    @Body() body: AdminPlatePrefixDto,
  ) {
    return this.catalog.updatePrefix(prefixId, body);
  }

  @Delete('catalog/prefixes/:prefixId')
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_WRITE)
  @ApiOperation({ summary: 'Soft-delete plate prefix' })
  removePrefix(@Param('prefixId') prefixId: string) {
    return this.catalog.removePrefix(prefixId);
  }

  @Get('verifications')
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_READ)
  @ApiOperation({ summary: 'List plate verification events' })
  listVerifications(@Query() query: AdminVerificationsQueryDto) {
    return this.catalog.listVerifications(query);
  }

  @Get()
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_READ)
  @ApiOperation({ summary: 'List/search plate listings (admin)' })
  list(@Query() query: AdminPlatesQueryDto): Promise<unknown> {
    return this.plates.list(query);
  }

  @Get(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_READ)
  @ApiOperation({ summary: 'Get plate listing by id' })
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.plates.findById(id);
  }

  @Post(':id/approve')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Approve plate listing → ACTIVE' })
  approve(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.plates.approve(id, user, adminRequestContext(req));
  }

  @Post(':id/reject')
  @Permissions(Permission.ADMIN_ACCESS, Permission.LISTINGS_MODERATE)
  @ApiOperation({ summary: 'Reject plate listing → REJECTED' })
  reject(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.plates.reject(id, user, adminRequestContext(req));
  }

  @Post()
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_WRITE)
  @ApiOperation({ summary: 'Create plate listing (admin)' })
  create(
    @Body() body: AdminCreatePlateDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.plates.create(body, user, adminRequestContext(req));
  }

  @Patch(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_WRITE)
  @ApiOperation({ summary: 'Update plate listing (admin)' })
  update(
    @Param('id') id: string,
    @Body() body: AdminUpdatePlateDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.plates.update(id, body, user, adminRequestContext(req));
  }

  @Delete(':id')
  @Permissions(Permission.ADMIN_ACCESS, Permission.PLATES_WRITE)
  @ApiOperation({ summary: 'Delete plate listing (admin)' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.plates.remove(id, user, adminRequestContext(req));
  }
}
