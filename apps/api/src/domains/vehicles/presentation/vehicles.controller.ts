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
import { VehiclesService } from '../application/vehicles.service';
import { VehicleSearchService } from '../application/vehicle-search.service';
import {
  CreateVehicleDto,
  mapCreateVehicleDto,
} from './dto/create-vehicle.dto';
import {
  UpdateVehicleDto,
  mapUpdateVehicleDto,
} from './dto/update-vehicle.dto';
import { ListVehiclesDto, mapListVehiclesDto } from './dto/list-vehicles.dto';
import {
  SearchVehiclesDto,
  mapSearchVehiclesDto,
} from './dto/search-vehicles.dto';
import { ChangeVehicleStatusDto } from './dto/change-vehicle-status.dto';
import { VehicleContactClickDto } from './dto/vehicle-contact-click.dto';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(
    private readonly vehicles: VehiclesService,
    private readonly vehicleSearch: VehicleSearchService,
  ) {}

  @Public()
  @Get('search')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Search vehicles with make/model/year/mileage filters',
    description: 'Always scoped to MarketplaceDomain.VEHICLE.',
  })
  search(
    @Query() query: SearchVehiclesDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.vehicleSearch.search(mapSearchVehiclesDto(query), user);
  }

  @Public()
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'List vehicles',
    description:
      'Public callers see ACTIVE vehicles. Authenticated owners/staff can filter broader statuses; use mine=true for own vehicles.',
  })
  list(
    @Query() query: ListVehiclesDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.vehicles.list(mapListVehiclesDto(query), user);
  }

  @Public()
  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get vehicle by id (listing id)' })
  findOne(@Param('id') id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.vehicles.findById(id, user);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_CREATE)
  @ApiOperation({ summary: 'Create a draft vehicle listing' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateVehicleDto) {
    return this.vehicles.create(user, mapCreateVehicleDto(body));
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_UPDATE)
  @ApiOperation({ summary: 'Update own vehicle (admins: any)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateVehicleDto,
  ) {
    return this.vehicles.update(id, user, mapUpdateVehicleDto(body));
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_DELETE)
  @ApiOperation({ summary: 'Soft-delete vehicle' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.vehicles.softDelete(id, user);
  }

  @Patch(':id/status')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_UPDATE)
  @ApiOperation({
    summary: 'Transition vehicle status',
    description: 'PENDING → ACTIVE requires LISTINGS_MODERATE (moderator/admin).',
  })
  changeStatus(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ChangeVehicleStatusDto,
  ) {
    return this.vehicles.changeStatus(id, user, body.status);
  }

  @Public()
  @Post(':id/contact-click')
  @ApiOperation({ summary: 'Record phone / WhatsApp contact click' })
  contactClick(@Param('id') id: string, @Body() body: VehicleContactClickDto) {
    return this.vehicles.contactClick(id, body.channel);
  }
}
