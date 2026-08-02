import { Module } from '@nestjs/common';
import { ListingsModule } from '../listings/listings.module';
import { SearchModule } from '../search/search.module';
import { VehiclesController } from './presentation/vehicles.controller';
import { VehiclesService } from './application/vehicles.service';
import { VehicleSearchService } from './application/vehicle-search.service';
import { VehicleRepository } from './infrastructure/vehicle.repository';

/**
 * Vehicles domain — vehicle business logic on shared Listing hub (Sprint 20).
 */
@Module({
  imports: [ListingsModule, SearchModule],
  controllers: [VehiclesController],
  providers: [
    VehiclesService,
    VehicleSearchService,
    VehicleRepository,
  ],
  exports: [VehiclesService, VehicleSearchService],
})
export class VehiclesModule {}
