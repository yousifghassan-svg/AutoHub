import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { R2Module } from '../../infrastructure/storage/r2.module';
import { PublicDealersService } from './application/public-dealers.service';
import { DealerAccountsService } from './application/dealer-accounts.service';
import { DealersController } from './presentation/dealers.controller';

@Module({
  imports: [PrismaModule, R2Module],
  controllers: [DealersController],
  providers: [PublicDealersService, DealerAccountsService],
  exports: [PublicDealersService, DealerAccountsService],
})
export class DealersModule {}
