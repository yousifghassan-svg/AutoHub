import { Module } from '@nestjs/common';
import { SearchController } from './presentation/search.controller';
import { SearchService } from './application/search.service';
import { DiscoveryRepository } from './infrastructure/discovery.repository';

/**
 * Search & Discovery domain — high-performance listing search (Sprint 5).
 * No AI recommendations.
 */
@Module({
  controllers: [SearchController],
  providers: [SearchService, DiscoveryRepository],
  exports: [SearchService],
})
export class SearchModule {}
