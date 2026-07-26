import { Injectable } from '@nestjs/common';
import { ListingStatus } from '@autohub/database';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { canModerateListings } from '../../listings/domain/listing.policies';
import {
  PlateRepository,
  type PlateSearchParams,
} from '../infrastructure/plate.repository';

@Injectable()
export class PlateSearchService {
  constructor(private readonly plates: PlateRepository) {}

  searchPublic(params: PlateSearchParams) {
    return this.plates.search({
      ...params,
      status: ListingStatus.ACTIVE,
    });
  }

  search(params: PlateSearchParams, actor?: AuthenticatedUser) {
    if (!actor) {
      return this.searchPublic(params);
    }

    if (params.sellerId === actor.id) {
      return this.plates.search(params);
    }

    if (canModerateListings(actor.role, actor.permissions)) {
      return this.plates.search(params);
    }

    return this.searchPublic(params);
  }
}
