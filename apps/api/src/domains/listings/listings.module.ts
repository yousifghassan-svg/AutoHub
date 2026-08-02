import { Module } from '@nestjs/common';
import { ListingsController } from './presentation/listings.controller';
import { ListingsService } from './application/listings.service';
import { ListingValidationService } from './application/listing-validation.service';
import { ListingPublishCompletenessService } from './application/listing-publish-completeness.service';
import { ListingRepository } from './infrastructure/listing.repository';
import { ListingMediaRepository } from './infrastructure/listing-media.repository';
import { ThumbnailService } from './infrastructure/thumbnail.service';
import { MediaModule } from '../media/media.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CurrenciesModule } from '../currencies/currencies.module';

/**
 * Listings domain — lifecycle, media, and search (Sprint 4 / Sprint 17 media bridge).
 */
@Module({
  imports: [MediaModule, NotificationsModule, CurrenciesModule],
  controllers: [ListingsController],
  providers: [
    ListingsService,
    ListingValidationService,
    ListingPublishCompletenessService,
    ListingRepository,
    ListingMediaRepository,
    ThumbnailService,
  ],
  exports: [
    ListingsService,
    ListingValidationService,
    ListingPublishCompletenessService,
  ],
})
export class ListingsModule {}
