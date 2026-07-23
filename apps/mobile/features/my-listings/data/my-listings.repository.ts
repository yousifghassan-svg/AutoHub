import type { HttpClient } from '@/lib/api/http-client';
import { mapManagedListing } from '../domain/mappers';
import type {
  EditListingInput,
  ListingStatus,
  ManagedListing,
  ManagedListingsPage,
  StatusTab,
} from '../domain/types';
import { OWNER_TRANSITIONS } from '../domain/types';
import { MOCK_MY_LISTINGS } from './mock-my-listings';
import type { MyListingsCache } from './my-listings-cache';

export type MyListingsRepository = {
  listMine(params: {
    tab: StatusTab;
    page: number;
    pageSize?: number;
  }): Promise<ManagedListingsPage>;
  changeStatus(id: string, status: ListingStatus): Promise<ManagedListing>;
  softDelete(id: string): Promise<ManagedListing>;
  update(id: string, input: EditListingInput): Promise<ManagedListing>;
  duplicate(listing: ManagedListing): Promise<ManagedListing>;
  /** Renew = clone into a fresh DRAFT (no renew endpoint on API). */
  renew(listing: ManagedListing): Promise<ManagedListing>;
};

type ListingsApiPage = {
  items: Parameters<typeof mapManagedListing>[0][];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function paginate(items: ManagedListing[], page: number, pageSize: number): ManagedListingsPage {
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return {
    items: slice,
    page,
    pageSize,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

export function createApiMyListingsRepository(deps: {
  http: HttpClient;
  cache: MyListingsCache;
  locale?: 'ar' | 'ku' | 'en';
}): MyListingsRepository {
  const { http, cache } = deps;
  const locale = deps.locale ?? 'ar';

  return {
    async listMine({ tab, page, pageSize = 20 }) {
      const qs = new URLSearchParams({
        mine: 'true',
        page: String(page),
        pageSize: String(pageSize),
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
      // API sortBy may not include updatedAt — fall back to createdAt if needed
      qs.set('sortBy', 'createdAt');
      if (tab !== 'ALL') qs.set('status', tab);

      try {
        const data = await http.get<ListingsApiPage>(`/v1/listings?${qs.toString()}`, true);
        const mapped = {
          ...data,
          items: data.items.map((i) => mapManagedListing(i, locale)),
        };
        if (page === 1) await cache.set(tab, mapped.items);
        return mapped;
      } catch (error) {
        const cached = await cache.get(tab);
        if (cached) {
          return paginate(cached, page, pageSize);
        }
        throw error;
      }
    },

    async changeStatus(id, status) {
      const updated = await http.request<Parameters<typeof mapManagedListing>[0]>(
        `/v1/listings/${id}/status`,
        { method: 'PATCH', body: { status } },
      );
      return mapManagedListing(updated, locale);
    },

    async softDelete(id) {
      const deleted = await http.request<Parameters<typeof mapManagedListing>[0]>(
        `/v1/listings/${id}`,
        { method: 'DELETE' },
      );
      return mapManagedListing(deleted, locale);
    },

    async update(id, input) {
      const updated = await http.request<Parameters<typeof mapManagedListing>[0]>(
        `/v1/listings/${id}`,
        {
          method: 'PATCH',
          body: {
            title: input.title,
            description: input.description,
            primaryPrice: input.primaryPrice,
          },
        },
      );
      return mapManagedListing(updated, locale);
    },

    async duplicate(listing) {
      const created = await http.post<Parameters<typeof mapManagedListing>[0]>('/v1/listings', {
        categoryId: listing.categoryId,
        cityId: listing.cityId,
        title: `${listing.title} (copy)`.slice(0, 200),
        description:
          listing.description.length >= 10
            ? listing.description
            : `${listing.description} — duplicated listing.`,
        primaryPrice: listing.price ?? undefined,
        primaryCurrencyId: listing.primaryCurrencyId ?? undefined,
      });
      return mapManagedListing(created, locale);
    },

    renew(listing) {
      return this.duplicate(listing);
    },
  };
}

export function createMockMyListingsRepository(deps: {
  cache: MyListingsCache;
}): MyListingsRepository {
  const { cache } = deps;
  let items = [...MOCK_MY_LISTINGS];

  return {
    async listMine({ tab, page, pageSize = 20 }) {
      const filtered =
        tab === 'ALL' ? items : items.filter((x) => x.status === tab);
      const pageData = paginate(filtered, page, pageSize);
      if (page === 1) await cache.set(tab, filtered);
      return pageData;
    },

    async changeStatus(id, status) {
      const current = items.find((x) => x.id === id);
      if (!current) throw new Error('Listing not found');
      const allowed = OWNER_TRANSITIONS[current.status];
      if (status !== current.status && !allowed.includes(status)) {
        throw new Error(`Cannot transition ${current.status} → ${status}`);
      }
      const next: ManagedListing = {
        ...current,
        status,
        soldAt: status === 'SOLD' ? new Date().toISOString() : current.soldAt,
        publishedAt:
          status === 'ACTIVE' && !current.publishedAt
            ? new Date().toISOString()
            : current.publishedAt,
        updatedAt: new Date().toISOString(),
      };
      items = items.map((x) => (x.id === id ? next : x));
      return next;
    },

    async softDelete(id) {
      return this.changeStatus(id, 'ARCHIVED');
    },

    async update(id, input) {
      const current = items.find((x) => x.id === id);
      if (!current) throw new Error('Listing not found');
      if (current.status === 'SOLD' || current.status === 'ARCHIVED') {
        throw new Error('Cannot edit sold or archived listings');
      }
      const next: ManagedListing = {
        ...current,
        title: input.title,
        description: input.description,
        price: input.primaryPrice ?? current.price,
        updatedAt: new Date().toISOString(),
      };
      items = items.map((x) => (x.id === id ? next : x));
      return next;
    },

    async duplicate(listing) {
      const copy: ManagedListing = {
        ...listing,
        id: `mine-copy-${Date.now()}`,
        slug: `${listing.slug}-copy`,
        title: `${listing.title} (copy)`,
        status: 'DRAFT',
        publishedAt: null,
        soldAt: null,
        isFeatured: false,
        stats: {
          views: 0,
          favorites: 0,
          phoneClicks: null,
          whatsappClicks: null,
          shares: null,
        },
        updatedAt: new Date().toISOString(),
      };
      items = [copy, ...items];
      return copy;
    },

    renew(listing) {
      return this.duplicate(listing);
    },
  };
}
