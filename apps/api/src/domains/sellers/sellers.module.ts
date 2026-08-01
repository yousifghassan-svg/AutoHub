import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { SellersService } from './application/sellers.service';
import { SellersController } from './presentation/sellers.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SellersController],
  providers: [SellersService],
  exports: [SellersService],
})
export class SellersModule {}
