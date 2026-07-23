import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type SavedSearch } from '@autohub/database';
import type { AuthenticatedUser } from '../../auth/domain/auth.types';
import {
  DiscoveryRepository,
  type DiscoveryListing,
} from '../infrastructure/discovery.repository';
import {
  SearchFilters,
  SearchSort,
  type SearchSuggestion,
} from '../domain/search.types';

export type RecentSearchItem = {
  id: string;
  keyword: string | null;
  categoryId: string | null;
  brandId: string | null;
  modelId: string | null;
  cityId: string | null;
  governorateId: string | null;
  filters: Prisma.JsonValue;
  resultCount: number;
  createdAt: Date;
};

@Injectable()
export class SearchService {
  constructor(private readonly discovery: DiscoveryRepository) {}

  async search(
    filters: SearchFilters,
    actor?: AuthenticatedUser,
    sessionId?: string,
  ) {
    const page = filters.page ?? 1;
    const pageSize = Math.min(filters.pageSize ?? 20, 100);
    const sort = filters.sort ?? SearchSort.NEWEST;

    const { items, total } = await this.discovery.search({
      ...filters,
      page,
      pageSize,
      sort,
    });

    // Analytics off the critical path (best-effort)
    void this.discovery
      .recordEvent({
        userId: actor?.id,
        sessionId,
        keyword: filters.q?.trim() || undefined,
        categoryId: filters.categoryId,
        brandId: filters.brandId,
        modelId: filters.modelId,
        cityId: filters.cityId,
        governorateId: filters.governorateId,
        filters: filters as unknown as Prisma.InputJsonValue,
        resultCount: total,
      })
      .catch(() => undefined);

    return {
      items: items.map((item) => this.toCard(item)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 0,
      sort,
    };
  }

  async suggestions(q: string, limit = 8): Promise<SearchSuggestion[]> {
    const query = q.trim();
    if (query.length < 1) return [];

    const take = Math.min(limit, 20);
    const [brands, models, cities, plates, keywords] = await Promise.all([
      this.discovery.suggestBrands(query, take),
      this.discovery.suggestModels(query, take),
      this.discovery.suggestCities(query, take),
      this.discovery.suggestPlates(query, take),
      this.discovery.suggestKeywords(query, take),
    ]);

    const suggestions: SearchSuggestion[] = [];

    for (const brand of brands) {
      suggestions.push({
        type: 'BRAND',
        id: brand.id,
        label: brand.nameEn,
        meta: { nameAr: brand.nameAr, slug: brand.slug, category: brand.category },
      });
    }
    for (const model of models) {
      suggestions.push({
        type: 'MODEL',
        id: model.id,
        label: model.nameEn,
        meta: {
          nameAr: model.nameAr,
          brandId: model.brandId,
          brandName: model.brand.nameEn,
        },
      });
    }
    for (const city of cities) {
      suggestions.push({
        type: 'CITY',
        id: city.id,
        label: city.nameEn,
        meta: {
          nameAr: city.nameAr,
          governorateId: city.governorateId,
          governorate: city.governorate.nameEn,
        },
      });
    }
    for (const plate of plates) {
      suggestions.push({
        type: 'PLATE',
        id: plate.listingId,
        label: plate.plateDisplay,
        meta: {
          normalized: plate.plateNormalized,
          formatCode: plate.formatCode,
        },
      });
    }
    for (const kw of keywords) {
      suggestions.push({
        type: 'KEYWORD',
        label: kw.keyword,
        meta: { hitCount: kw.hitCount },
      });
    }

    return suggestions.slice(0, take * 2);
  }

  async trending(days = 7, limit = 10) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const take = Math.min(limit, 25);

    const [brandGroups, modelGroups, categoryGroups] = await Promise.all([
      this.discovery.trendingBrands(since, take),
      this.discovery.trendingModels(since, take),
      this.discovery.trendingCategories(since, take),
    ]);

    const brandIds = brandGroups.map((g) => g.brandId).filter(Boolean) as string[];
    const modelIds = modelGroups.map((g) => g.modelId).filter(Boolean) as string[];
    const categoryIds = categoryGroups
      .map((g) => g.categoryId)
      .filter(Boolean) as string[];

    const [brands, models, categories] = await Promise.all([
      this.discovery.findBrandsByIds(brandIds),
      this.discovery.findModelsByIds(modelIds),
      this.discovery.findCategoriesByIds(categoryIds),
    ]);

    const brandMap = new Map(brands.map((b) => [b.id, b]));
    const modelMap = new Map(models.map((m) => [m.id, m]));
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return {
      windowDays: days,
      brands: brandGroups
        .filter((g) => g.brandId && brandMap.has(g.brandId))
        .map((g) => ({
          ...brandMap.get(g.brandId!)!,
          searchCount: g._count.brandId,
        })),
      models: modelGroups
        .filter((g) => g.modelId && modelMap.has(g.modelId))
        .map((g) => ({
          ...modelMap.get(g.modelId!)!,
          searchCount: g._count.modelId,
        })),
      categories: categoryGroups
        .filter((g) => g.categoryId && categoryMap.has(g.categoryId))
        .map((g) => ({
          ...categoryMap.get(g.categoryId!)!,
          searchCount: g._count.categoryId,
        })),
    };
  }

  async recent(actor: AuthenticatedUser, limit = 20): Promise<RecentSearchItem[]> {
    const take = Math.min(limit, 50);
    const rows = await this.discovery.recentForUser(actor.id, take);
    const seen = new Set<string>();
    const deduped: RecentSearchItem[] = [];

    for (const row of rows) {
      const key = [
        row.keyword ?? '',
        row.brandId ?? '',
        row.modelId ?? '',
        row.categoryId ?? '',
        row.cityId ?? '',
      ].join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push({
        id: row.id,
        keyword: row.keyword,
        categoryId: row.categoryId,
        brandId: row.brandId,
        modelId: row.modelId,
        cityId: row.cityId,
        governorateId: row.governorateId,
        filters: row.filters,
        resultCount: row.resultCount,
        createdAt: row.createdAt,
      });
      if (deduped.length >= take) break;
    }

    return deduped;
  }

  async saveSearch(
    actor: AuthenticatedUser,
    input: {
      name?: string;
      query?: string;
      filters: Record<string, unknown>;
      sort?: SearchSort;
      notify?: boolean;
    },
  ): Promise<SavedSearch> {
    return this.discovery.createSaved({
      userId: actor.id,
      name: input.name,
      query: input.query ?? (input.filters.q as string | undefined),
      filters: input.filters as Prisma.InputJsonValue,
      sort: input.sort ?? SearchSort.NEWEST,
      notify: input.notify ?? false,
    });
  }

  async listSaved(actor: AuthenticatedUser): Promise<SavedSearch[]> {
    return this.discovery.listSaved(actor.id);
  }

  async deleteSaved(actor: AuthenticatedUser, id: string) {
    const saved = await this.discovery.findSaved(id, actor.id);
    if (!saved) throw new NotFoundException('Saved search not found');
    if (saved.userId !== actor.id) {
      throw new ForbiddenException('Not allowed');
    }
    await this.discovery.softDeleteSaved(id);
    return { success: true as const };
  }

  private toCard(listing: DiscoveryListing) {
    return {
      id: listing.id,
      slug: listing.slug,
      status: listing.status,
      categoryCode: listing.categoryCode,
      primaryPrice:
        listing.primaryPrice != null ? Number(listing.primaryPrice) : null,
      primaryCurrencyId: listing.primaryCurrencyId,
      cityId: listing.cityId,
      governorateId: listing.city.governorateId,
      isFeatured: listing.isFeatured,
      isVerified: listing.isVerified,
      viewsCount: listing.viewsCount,
      publishedAt: listing.publishedAt,
      createdAt: listing.createdAt,
      title: listing.translations[0]?.title ?? listing.metaTitle ?? listing.slug,
      thumbnailKey: listing.media[0]?.thumbnailKey ?? listing.media[0]?.r2Key ?? null,
      category: listing.category,
      city: {
        id: listing.city.id,
        nameEn: listing.city.nameEn,
        nameAr: listing.city.nameAr,
        governorate: listing.city.governorate,
      },
      carDetails: listing.carDetails,
      motorcycleDetails: listing.motorcycleDetails,
      truckDetails: listing.truckDetails,
      plateDetails: listing.plateDetails,
    };
  }
}
