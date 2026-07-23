import { Module } from '@nestjs/common';
import { ListingsController } from './presentation/listings.controller';
import { ListingsService } from './application/listings.service';
import { ListingValidationService } from './application/listing-validation.service';
import { ListingRepository } from './infrastructure/listing.repository';
import { ListingMediaRepository } from './infrastructure/listing-media.repository';
import { ThumbnailService } from './infrastructure/thumbnail.service';

/**
 * Listings domain — lifecycle, media, and search (Sprint 4).
 */
@Module({
  controllers: [ListingsController],
  providers: [
    ListingsService,
    ListingValidationService,
    ListingRepository,
    ListingMediaRepository,
    ThumbnailService,
  ],
  exports: [ListingsService],
})
export class ListingsModule {}
