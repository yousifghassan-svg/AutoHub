import { Module } from '@nestjs/common';
import { MediaController } from './presentation/media.controller';
import { MediaService } from './application/media.service';
import { MediaCleanupService } from './application/media-cleanup.service';
import { MediaValidationService } from './application/media-validation.service';
import { MediaAssetRepository } from './infrastructure/media-asset.repository';
import { ImageProcessingService } from './infrastructure/image-processing.service';
import { VideoProcessingService } from './infrastructure/video-processing.service';
import { NoOpVirusScanner } from './infrastructure/virus-scanner.noop';
import { VIRUS_SCANNER } from './domain/media.policies';

/**
 * Enterprise media platform — independent of Listings; reusable by any module
 * via ownerModule / ownerEntityId.
 */
@Module({
  controllers: [MediaController],
  providers: [
    MediaService,
    MediaCleanupService,
    MediaValidationService,
    MediaAssetRepository,
    ImageProcessingService,
    VideoProcessingService,
    { provide: VIRUS_SCANNER, useClass: NoOpVirusScanner },
  ],
  exports: [MediaService, MediaCleanupService],
})
export class MediaModule {}
