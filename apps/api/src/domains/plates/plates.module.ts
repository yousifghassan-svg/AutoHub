import { Module } from '@nestjs/common';
import { ListingsModule } from '../listings/listings.module';
import { CurrenciesModule } from '../currencies/currencies.module';
import { PlateCatalogService } from './application/plate-catalog.service';
import { PlateSearchService } from './application/plate-search.service';
import { PlatesService } from './application/plates.service';
import { PlateRepository } from './infrastructure/plate.repository';
import { PlatesController } from './presentation/plates.controller';

/**
 * Plates domain — plate marketplace listings, search, catalog, verification (Sprint 20).
 */
@Module({
  imports: [ListingsModule, CurrenciesModule],
  controllers: [PlatesController],
  providers: [
    PlateRepository,
    PlatesService,
    PlateSearchService,
    PlateCatalogService,
  ],
  exports: [PlatesService, PlateSearchService, PlateCatalogService, PlateRepository],
})
export class PlatesModule {}
