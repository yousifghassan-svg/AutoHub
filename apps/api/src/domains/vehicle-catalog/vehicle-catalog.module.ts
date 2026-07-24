import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { CatalogFiltersService } from './application/catalog-filters.service';
import { CatalogController } from './presentation/catalog.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CatalogController],
  providers: [CatalogFiltersService],
  exports: [CatalogFiltersService],
})
export class VehicleCatalogModule {}
