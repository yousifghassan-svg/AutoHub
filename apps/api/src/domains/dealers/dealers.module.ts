import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { PublicDealersService } from './application/public-dealers.service';
import { DealersController } from './presentation/dealers.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DealersController],
  providers: [PublicDealersService],
  exports: [PublicDealersService],
})
export class DealersModule {}
