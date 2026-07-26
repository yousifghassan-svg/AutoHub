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
import { PlateCatalogService } from '../application/plate-catalog.service';
import { PlateSearchService } from '../application/plate-search.service';
import { PlatesService } from '../application/plates.service';
import { CreatePlateDto } from './dto/create-plate.dto';
import {
  PlatePrefixQueryDto,
  PlateSearchQueryDto,
  PlatesQueryDto,
} from './dto/plate-query.dto';
import { UpdatePlateDto } from './dto/update-plate.dto';
import { VerifyPlateDto } from './dto/verify-plate.dto';
import { ChangePlateStatusDto } from './dto/change-plate-status.dto';
import { PlateContactClickDto } from './dto/plate-contact-click.dto';

@ApiTags('plates')
@Controller('plates')
export class PlatesController {
  constructor(
    private readonly plates: PlatesService,
    private readonly search: PlateSearchService,
    private readonly catalog: PlateCatalogService,
  ) {}

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search active plate listings' })
  searchPlates(
    @Query() query: PlateSearchQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.search.search(query, user);
  }

  @Public()
  @Get('catalog/categories')
  @ApiOperation({ summary: 'List active plate categories' })
  catalogCategories() {
    return this.catalog.listCategories();
  }

  @Public()
  @Get('catalog/prefixes')
  @ApiOperation({ summary: 'List active plate prefixes' })
  catalogPrefixes(@Query() query: PlatePrefixQueryDto) {
    return this.catalog.listPrefixes(query.formatCode);
  }

  @Public()
  @Get('catalog/provinces')
  @ApiOperation({ summary: 'List governorates with plate formats' })
  catalogProvinces() {
    return this.catalog.listProvinces();
  }

  @Public()
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List plate listings (public: ACTIVE only)' })
  list(
    @Query() query: PlatesQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const params = {
      ...query,
      sellerId: query.mine && user ? user.id : undefined,
    };
    return this.plates.list(params, user);
  }

  @Public()
  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get plate listing by id' })
  findOne(@Param('id') id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.plates.findById(id, user);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_CREATE)
  @ApiOperation({ summary: 'Create a draft plate listing' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreatePlateDto) {
    return this.plates.create(user, body);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_UPDATE)
  @ApiOperation({ summary: 'Update own plate listing' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdatePlateDto,
  ) {
    return this.plates.update(id, user, body);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_DELETE)
  @ApiOperation({ summary: 'Soft-delete plate listing' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.plates.remove(id, user);
  }

  @Patch(':id/status')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_UPDATE)
  @ApiOperation({
    summary: 'Transition plate status',
    description: 'PENDING → ACTIVE requires LISTINGS_MODERATE (moderator/admin).',
  })
  changeStatus(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ChangePlateStatusDto,
  ) {
    return this.plates.changeStatus(id, user, body.status);
  }

  @Public()
  @Post(':id/contact-click')
  @ApiOperation({ summary: 'Record phone / WhatsApp contact click' })
  contactClick(@Param('id') id: string, @Body() body: PlateContactClickDto) {
    return this.plates.contactClick(id, body.channel);
  }

  @Post(':id/verify')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.PLATES_WRITE)
  @ApiOperation({ summary: 'Record plate verification status' })
  verify(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: VerifyPlateDto,
  ) {
    return this.plates.verify(id, body, user);
  }
}
