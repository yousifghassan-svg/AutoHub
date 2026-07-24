import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../shared/decorators/public.decorator';
import { PublicDealersService } from '../application/public-dealers.service';
import { DealersQueryDto } from './dto/dealers-query.dto';

@ApiTags('dealers')
@Controller('dealers')
export class DealersController {
  constructor(private readonly dealers: PublicDealersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List verified dealer organizations' })
  list(@Query() query: DealersQueryDto) {
    return this.dealers.list(query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get dealer profile, statistics, and inventory' })
  findBySlug(@Param('slug') slug: string) {
    return this.dealers.getBySlug(slug);
  }
}
