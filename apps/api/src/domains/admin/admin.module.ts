import { Module } from '@nestjs/common';
import { PlatesModule } from '../plates/plates.module';
import { CommunicationModule } from '../communication/communication.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminAuditService } from './application/admin-audit.service';
import { AdminAuditQueryService } from './application/admin-audit-query.service';
import { AdminDashboardService } from './application/admin-dashboard.service';
import { AdminDealersService } from './application/admin-dealers.service';
import { AdminListingsService } from './application/admin-listings.service';
import { AdminPlatesService } from './application/admin-plates.service';
import { AdminVehiclesService } from './application/admin-vehicles.service';
import { AdminReportsService } from './application/admin-reports.service';
import { AdminCommunicationService } from './application/admin-communication.service';
import { AdminSettingsService } from './application/admin-settings.service';
import { AdminStatsService } from './application/admin-stats.service';
import { AdminUsersService } from './application/admin-users.service';
import { AdminAuditController } from './presentation/admin-audit.controller';
import { AdminCommunicationController } from './presentation/admin-communication.controller';
import { AdminDashboardController } from './presentation/admin-dashboard.controller';
import { AdminDealersController } from './presentation/admin-dealers.controller';
import { AdminListingsController } from './presentation/admin-listings.controller';
import { AdminPlatesController } from './presentation/admin-plates.controller';
import { AdminVehiclesController } from './presentation/admin-vehicles.controller';
import { AdminReportsController } from './presentation/admin-reports.controller';
import { AdminSettingsController } from './presentation/admin-settings.controller';
import { AdminStatsController } from './presentation/admin-stats.controller';
import { AdminUsersController } from './presentation/admin-users.controller';
import { ReportsController } from './presentation/reports.controller';

/**
 * Admin platform — dashboard, moderation, CRM, settings, audit, stats.
 */
@Module({
  imports: [PlatesModule, CommunicationModule, NotificationsModule],
  controllers: [
    AdminDashboardController,
    AdminListingsController,
    AdminVehiclesController,
    AdminPlatesController,
    AdminDealersController,
    AdminUsersController,
    AdminReportsController,
    ReportsController,
    AdminSettingsController,
    AdminStatsController,
    AdminAuditController,
    AdminCommunicationController,
  ],
  providers: [
    AdminAuditService,
    AdminAuditQueryService,
    AdminDashboardService,
    AdminListingsService,
    AdminVehiclesService,
    AdminPlatesService,
    AdminDealersService,
    AdminUsersService,
    AdminReportsService,
    AdminCommunicationService,
    AdminSettingsService,
    AdminStatsService,
  ],
  exports: [AdminAuditService, AdminReportsService, AdminSettingsService],
})
export class AdminModule {}
