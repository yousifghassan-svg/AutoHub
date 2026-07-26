import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../shared/decorators/public.decorator';
import { CurrenciesService } from '../application/currencies.service';

@ApiTags('currencies')
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currencies: CurrenciesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List active currencies (financial catalog)' })
  list() {
    return this.currencies.listActive();
  }
}
