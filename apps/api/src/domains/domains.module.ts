import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ListingsModule } from './listings/listings.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { CategoriesModule } from './categories/categories.module';
import { LocationsModule } from './locations/locations.module';
import { VehicleCatalogModule } from './vehicle-catalog/vehicle-catalog.module';
import { MediaModule } from './media/media.module';
import { SearchModule } from './search/search.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DealersModule } from './dealers/dealers.module';
import { SellersModule } from './sellers/sellers.module';
import { PlatesModule } from './plates/plates.module';
import { CommunicationModule } from './communication/communication.module';
import { AdminModule } from './admin/admin.module';
import { CommonModule } from './common/common.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { PaymentsModule } from './payments/payments.module';

/**
 * Aggregates all domain modules for AppModule composition.
 * Active domains: Auth, Users, Listings, Vehicles, Search, Media, Plates, Currencies, Sellers.
 */
@Module({
  imports: [
    CommonModule,
    AuthModule,
    UsersModule,
    CurrenciesModule,
    PaymentsModule,
    ListingsModule,
    VehiclesModule,
    CategoriesModule,
    LocationsModule,
    VehicleCatalogModule,
    MediaModule,
    SearchModule,
    NotificationsModule,
    DealersModule,
    SellersModule,
    PlatesModule,
    CommunicationModule,
    AdminModule,
  ],
})
export class DomainsModule {}
