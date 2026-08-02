import { ForbiddenException, Injectable } from '@nestjs/common';
import { ListingStatus, type Prisma } from '@autohub/database';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { SearchService } from '../../search/application/search.service';
import { canModerateVehicles } from '../domain/vehicle.policies';
import { VehicleRepository } from '../infrastructure/vehicle.repository';
import { VehiclesService } from './vehicles.service';
import type { SearchVehiclesInput } from './types/vehicle.input';

@Injectable()
export class VehicleSearchService {
  constructor(
    private readonly vehicles: VehicleRepository,
    private readonly vehiclesService: VehiclesService,
    private readonly searchAnalytics: SearchService,
  ) {}

  async search(query: SearchVehiclesInput, actor?: AuthenticatedUser) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const hasKeyword = Boolean(query.keyword?.trim());
    const sortBy =
      query.sortBy ?? (hasKeyword ? 'relevance' : 'createdAt');
    const sortOrder = query.sortOrder ?? 'desc';

    const isStaff = actor ? canModerateVehicles(actor.role, actor.permissions) : false;
    const status = query.status;
    let statuses = query.statuses;
    const sellerId = query.mine ? actor?.id : query.sellerId;

    if (query.mine && !actor) {
      throw new ForbiddenException('Authentication required for mine=true');
    }

    const viewingOwn = Boolean(actor && sellerId && sellerId === actor.id);

    if (!isStaff && !viewingOwn) {
      if (!status && !statuses?.length) {
        statuses = [ListingStatus.ACTIVE];
      } else if (status && status !== ListingStatus.ACTIVE) {
        throw new ForbiddenException('Only ACTIVE vehicles are publicly searchable');
      } else if (statuses?.some((s) => s !== ListingStatus.ACTIVE)) {
        throw new ForbiddenException('Only ACTIVE vehicles are publicly searchable');
      }
    }

    const { items, total } = await this.vehicles.search({
      page,
      pageSize,
      sortBy,
      sortOrder,
      cityId: query.cityId,
      governorateId: query.governorateId,
      categoryId: query.categoryId,
      categoryCode: query.categoryCode,
      brandId: query.brandId,
      modelId: query.modelId,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      currencyCode: query.currencyCode,
      minYear: query.minYear,
      maxYear: query.maxYear,
      minMileage: query.minMileage,
      maxMileage: query.maxMileage,
      fuelTypeId: query.fuelTypeId,
      transmissionTypeId: query.transmissionTypeId,
      bodyTypeId: query.bodyTypeId,
      driveTypeId: query.driveTypeId,
      colorId: query.colorId,
      status,
      statuses,
      isFeatured: query.isFeatured,
      keyword: query.keyword,
      sellerId,
    });

    this.searchAnalytics.recordAnalytics({
      userId: actor?.id,
      keyword: query.keyword?.trim() || undefined,
      categoryId: query.categoryId,
      brandId: query.brandId,
      modelId: query.modelId,
      cityId: query.cityId,
      governorateId: query.governorateId,
      filters: {
        domain: 'VEHICLE',
        categoryCode: query.categoryCode,
        currencyCode: query.currencyCode,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        minYear: query.minYear,
        maxYear: query.maxYear,
        sortBy,
        sortOrder,
      } as Prisma.InputJsonValue,
      resultCount: total,
    });

    return {
      items: items.map((item) => this.vehiclesService.mapVehicleResponse(item)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 0,
      sortBy,
      sortOrder,
    };
  }
}
