import { Module } from '@nestjs/common';
import { CurrenciesService } from './application/currencies.service';
import { CurrenciesController } from './presentation/currencies.controller';

@Module({
  controllers: [CurrenciesController],
  providers: [CurrenciesService],
  exports: [CurrenciesService],
})
export class CurrenciesModule {}
