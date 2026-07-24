import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../shared/decorators/public.decorator';
import { CatalogFiltersService } from '../application/catalog-filters.service';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogFiltersService) {}

  @Public()
  @Get('filters')
  @ApiOperation({ summary: 'Marketplace filter reference data' })
  filters() {
    return this.catalog.getFilters();
  }
}
