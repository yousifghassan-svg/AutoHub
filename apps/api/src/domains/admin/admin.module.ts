import { Module } from '@nestjs/common';
import { AdminAuditService } from './application/admin-audit.service';
import { AdminAuditQueryService } from './application/admin-audit-query.service';
import { AdminDashboardService } from './application/admin-dashboard.service';
import { AdminDealersService } from './application/admin-dealers.service';
import { AdminListingsService } from './application/admin-listings.service';
import { AdminPlatesService } from './application/admin-plates.service';
import { AdminReportsService } from './application/admin-reports.service';
import { AdminSettingsService } from './application/admin-settings.service';
import { AdminStatsService } from './application/admin-stats.service';
import { AdminUsersService } from './application/admin-users.service';
import { AdminAuditController } from './presentation/admin-audit.controller';
import { AdminDashboardController } from './presentation/admin-dashboard.controller';
import { AdminDealersController } from './presentation/admin-dealers.controller';
import { AdminListingsController } from './presentation/admin-listings.controller';
import { AdminPlatesController } from './presentation/admin-plates.controller';
import { AdminReportsController } from './presentation/admin-reports.controller';
import { AdminSettingsController } from './presentation/admin-settings.controller';
import { AdminStatsController } from './presentation/admin-stats.controller';
import { AdminUsersController } from './presentation/admin-users.controller';
import { ReportsController } from './presentation/reports.controller';

/**
 * Admin platform — dashboard, moderation, CRM, settings, audit, stats.
 */
@Module({
  controllers: [
    AdminDashboardController,
    AdminListingsController,
    AdminPlatesController,
    AdminDealersController,
    AdminUsersController,
    AdminReportsController,
    ReportsController,
    AdminSettingsController,
    AdminStatsController,
    AdminAuditController,
  ],
  providers: [
    AdminAuditService,
    AdminAuditQueryService,
    AdminDashboardService,
    AdminListingsService,
    AdminPlatesService,
    AdminDealersService,
    AdminUsersService,
    AdminReportsService,
    AdminSettingsService,
    AdminStatsService,
  ],
  exports: [AdminAuditService, AdminReportsService, AdminSettingsService],
})
export class AdminModule {}
