import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { SavedSearch } from '@autohub/database';
import { Public } from '../../../shared/decorators/public.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Permission } from '../../auth/domain/permissions';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import { SearchService, type RecentSearchItem } from '../application/search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SuggestionsQueryDto } from './dto/suggestions-query.dto';
import { SaveSearchDto } from './dto/save-search.dto';
import { TrendingQueryDto } from './dto/trending-query.dto';
import { RecentQueryDto } from './dto/recent-query.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Public()
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Full-text multi-filter listing search',
    description:
      'Searches ACTIVE listings. Optional Bearer links the query to the user for recent/trending analytics.',
  })
  searchListings(
    @Query() query: SearchQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.search.search(query, user, sessionId);
  }

  @Public()
  @Get('suggestions')
  @ApiOperation({
    summary: 'Autocomplete suggestions',
    description: 'Brands, models, cities, plate numbers, and popular keywords.',
  })
  suggestions(@Query() query: SuggestionsQueryDto) {
    return this.search.suggestions(query.q, query.limit);
  }

  @Public()
  @Get('trending')
  @ApiOperation({
    summary: 'Trending search facets',
    description: 'Most searched brands, models, and categories in the recent window.',
  })
  trending(@Query() query: TrendingQueryDto) {
    return this.search.trending(query.days ?? 7, query.limit ?? 10);
  }

  @Get('recent')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_READ)
  @ApiOperation({ summary: 'Current user recent searches' })
  recent(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: RecentQueryDto,
  ): Promise<RecentSearchItem[]> {
    return this.search.recent(user, query.limit ?? 20);
  }

  @Post('save')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_READ)
  @ApiOperation({ summary: 'Save a search filter snapshot' })
  save(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SaveSearchDto,
  ): Promise<SavedSearch> {
    return this.search.saveSearch(user, body);
  }

  @Get('saved')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_READ)
  @ApiOperation({ summary: 'List saved searches' })
  listSaved(@CurrentUser() user: AuthenticatedUser): Promise<SavedSearch[]> {
    return this.search.listSaved(user);
  }

  @Delete('saved/:id')
  @ApiBearerAuth('access-token')
  @Permissions(Permission.LISTINGS_READ)
  @ApiOperation({ summary: 'Soft-delete a saved search' })
  deleteSaved(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.search.deleteSaved(user, id);
  }
}
