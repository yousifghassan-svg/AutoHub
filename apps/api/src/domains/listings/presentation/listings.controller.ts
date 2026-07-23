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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../../shared/decorators/public.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permissions';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { ListingsService } from '../application/listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { SearchListingsDto } from './dto/search-listings.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { AddMediaDto } from './dto/add-media.dto';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listings: ListingsService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_CREATE)
  @ApiOperation({ summary: 'Create a draft listing' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateListingDto) {
    return this.listings.create(user, body);
  }

  @Public()
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Search/list listings',
    description:
      'Public callers see ACTIVE listings. Authenticated owners/staff can filter broader statuses; use mine=true for own listings.',
  })
  search(
    @Query() query: SearchListingsDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.listings.search(query, user);
  }

  @Public()
  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get listing by id' })
  findOne(@Param('id') id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.listings.findById(id, user);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_UPDATE)
  @ApiOperation({ summary: 'Update own listing (admins: any)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateListingDto,
  ) {
    return this.listings.update(id, user, body);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_DELETE)
  @ApiOperation({ summary: 'Soft-delete listing' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.listings.softDelete(id, user);
  }

  @Post(':id/media')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_UPDATE)
  @ApiOperation({
    summary: 'Add listing media (IMAGE | VIDEO | 360_MEDIA)',
    description: 'Generates thumbnail key; optional imageBase64 produces a JPEG thumbnail buffer metadata.',
  })
  addMedia(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: AddMediaDto,
  ) {
    const sourceBuffer = body.imageBase64
      ? Buffer.from(body.imageBase64, 'base64')
      : undefined;

    return this.listings.addMedia(id, user, {
      mediaType: body.mediaType,
      r2Key: body.r2Key,
      sortOrder: body.sortOrder,
      mimeType: body.mimeType,
      byteSize: body.byteSize,
      confirmed: body.confirmed,
      sourceBuffer,
    });
  }

  @Delete(':id/media/:mediaId')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_UPDATE)
  @ApiOperation({
    summary: 'Soft-delete listing media',
    description: 'Path is /listings/:id/media/:mediaId (media id required for safe deletion).',
  })
  removeMedia(
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.listings.removeMedia(id, mediaId, user);
  }

  @Patch(':id/status')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_UPDATE)
  @ApiOperation({
    summary: 'Transition listing status',
    description: 'PENDING → ACTIVE requires LISTINGS_MODERATE (moderator/admin).',
  })
  changeStatus(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ChangeStatusDto,
  ) {
    return this.listings.changeStatus(id, user, body.status);
  }
}
