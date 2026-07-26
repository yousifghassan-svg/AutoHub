import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingCategoryCode, MarketplaceDomain } from '@autohub/database';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { isVehicleCategoryCode } from '../../vehicles/domain/vehicle.policies';
import { VEHICLE_DOMAIN } from '../../vehicles/domain/vehicle.constants';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import {
  AdminListingsService,
  type AdminCreateListingData,
  type AdminListingsQuery,
  type AdminUpdateListingData,
} from './admin-listings.service';

@Injectable()
export class AdminVehiclesService {
  constructor(
    private readonly listings: AdminListingsService,
    private readonly prisma: PrismaService,
  ) {}

  list(query: AdminListingsQuery): Promise<unknown> {
    return this.listings.list({
      ...query,
      domain: VEHICLE_DOMAIN,
    });
  }

  exportCsv(query: AdminListingsQuery): Promise<string> {
    return this.listings.exportCsv({
      ...query,
      domain: VEHICLE_DOMAIN,
    });
  }

  async findById(id: string, options?: { includeDeleted?: boolean }): Promise<unknown> {
    const listing = await this.listings.findById(id, options);
    this.assertVehicleListing(listing);
    return listing;
  }

  async create(
    actor: AuthenticatedUser,
    dto: AdminCreateListingData,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<unknown> {
    await this.assertVehicleCategory(dto.categoryId);
    return this.listings.create(
      actor,
      { ...dto, status: dto.status },
      ctx,
    );
  }

  async update(
    id: string,
    data: AdminUpdateListingData,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<unknown> {
    await this.findById(id);
    if (data.categoryId) await this.assertVehicleCategory(data.categoryId);
    return this.listings.update(id, data, actor, ctx);
  }

  async softDelete(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<unknown> {
    await this.findById(id);
    return this.listings.softDelete(id, actor, ctx);
  }

  async restore(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<unknown> {
    await this.findById(id, { includeDeleted: true });
    return this.listings.restore(id, actor, ctx);
  }

  async permanentDelete(
    id: string,
    actor: AuthenticatedUser,
    options?: { force?: boolean; ip?: string; userAgent?: string },
  ): Promise<unknown> {
    await this.findById(id, { includeDeleted: true });
    return this.listings.permanentDelete(id, actor, options);
  }

  async bulk(
    ids: string[],
    action: Parameters<AdminListingsService['bulk']>[1],
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<unknown> {
    return this.listings.bulk(ids, action, actor, ctx);
  }

  async approve(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<unknown> {
    await this.findById(id);
    return this.listings.approve(id, actor, ctx);
  }

  async publish(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<unknown> {
    await this.findById(id);
    return this.listings.publish(id, actor, ctx);
  }

  async unpublish(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<unknown> {
    await this.findById(id);
    return this.listings.unpublish(id, actor, ctx);
  }

  async reject(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<unknown> {
    await this.findById(id);
    return this.listings.reject(id, actor, ctx);
  }

  async archive(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<unknown> {
    await this.findById(id);
    return this.listings.archive(id, actor, ctx);
  }

  async duplicate(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<unknown> {
    await this.findById(id);
    return this.listings.duplicate(id, actor, ctx);
  }

  async feature(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<unknown> {
    await this.findById(id);
    return this.listings.feature(id, actor, ctx);
  }

  async unfeature(
    id: string,
    actor: AuthenticatedUser,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<unknown> {
    await this.findById(id);
    return this.listings.unfeature(id, actor, ctx);
  }

  private assertVehicleListing(listing: { domain?: string; categoryCode?: string; id: string }) {
    if (listing.domain && listing.domain !== MarketplaceDomain.VEHICLE) {
      throw new NotFoundException('Vehicle not found');
    }
    if (
      listing.categoryCode &&
      !isVehicleCategoryCode(listing.categoryCode as ListingCategoryCode)
    ) {
      throw new NotFoundException('Vehicle not found');
    }
  }

  private async assertVehicleCategory(categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, active: true, deletedAt: null },
    });
    if (!category || !isVehicleCategoryCode(category.code)) {
      throw new BadRequestException('Category must be a vehicle category');
    }
  }
}
