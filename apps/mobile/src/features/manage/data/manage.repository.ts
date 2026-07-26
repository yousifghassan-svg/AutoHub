import type { HttpClient } from '@/lib/api/http-client';
import { mapManagedItem } from '../domain/mappers';
import type { ManagedItem, ManagedPage, ManageStatus, ManageStatusTab } from '../domain/types';
import {
  pushListingNotification,
  statusChangeMessage,
  type ListingNotifyStatus,
} from '../../notifications/listing-notifications.store';

type ApiPage = {
  items: Parameters<typeof mapManagedItem>[0][];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ManageRepository = {
  listMine(params: {
    domain: 'VEHICLE' | 'PLATE';
    tab: ManageStatusTab;
    page: number;
    pageSize?: number;
  }): Promise<ManagedPage>;
  changeStatus(
    domain: 'VEHICLE' | 'PLATE',
    id: string,
    status: ManageStatus,
    title?: string,
  ): Promise<ManagedItem>;
  softDelete(domain: 'VEHICLE' | 'PLATE', id: string): Promise<void>;
  duplicate(domain: 'VEHICLE' | 'PLATE', item: ManagedItem): Promise<ManagedItem>;
};

function basePath(domain: 'VEHICLE' | 'PLATE') {
  return domain === 'VEHICLE' ? '/v1/vehicles' : '/v1/plates';
}

function apiStatusForTab(tab: ManageStatusTab): string | null {
  if (tab === 'ALL' || tab === 'EXPIRED') return null;
  return tab;
}

export function createManageRepository(
  http: HttpClient,
  locale: 'ar' | 'ku' | 'en' = 'ar',
): ManageRepository {
  return {
    async listMine({ domain, tab, page, pageSize = 20 }) {
      const qs = new URLSearchParams({
        mine: 'true',
        page: String(page),
        pageSize: String(pageSize),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      const status = apiStatusForTab(tab);
      if (status) qs.set('status', status);

      const data = await http.get<ApiPage>(`${basePath(domain)}?${qs.toString()}`, true);
      let items = data.items.map((i) => mapManagedItem(i, domain, locale));

      if (tab === 'EXPIRED') {
        items = items.filter((i) => i.status === 'EXPIRED');
      } else if (tab === 'ALL') {
        // keep all
      } else if (tab === 'ACTIVE') {
        items = items.filter((i) => i.status === 'ACTIVE');
      }

      return { ...data, items };
    },

    async changeStatus(domain, id, status, title) {
      const updated = await http.request<Parameters<typeof mapManagedItem>[0]>(
        `${basePath(domain)}/${id}/status`,
        { method: 'PATCH', body: { status } },
      );
      const item = mapManagedItem(updated, domain, locale);
      pushListingNotification({
        listingId: id,
        domain,
        title: title ?? item.title,
        status: status as ListingNotifyStatus,
        message: statusChangeMessage(status as ListingNotifyStatus),
      });
      return item;
    },

    async softDelete(domain, id) {
      await http.request(`${basePath(domain)}/${id}`, { method: 'DELETE' });
      pushListingNotification({
        listingId: id,
        domain,
        title: 'Listing',
        status: 'ARCHIVED',
        message: 'Listing was deleted (soft).',
      });
    },

    async duplicate(domain, item) {
      // No public duplicate endpoint — clone via create using source detail when needed.
      const title = `${item.title} (copy)`.slice(0, 200);
      const description =
        item.description.length >= 10
          ? item.description
          : `${item.description || item.title} — duplicated listing.`;

      if (domain === 'PLATE') {
        type PlateDetail = Parameters<typeof mapManagedItem>[0] & {
          plateDetails?: {
            formatCode?: string;
            regionCode?: string | null;
            series?: string | null;
            number?: string | null;
            plateCategoryId?: string | null;
            platePrefixId?: string | null;
            plateType?: string | null;
          } | null;
        };
        const source = await http.get<PlateDetail>(`${basePath(domain)}/${item.id}`, true);
        const pd = source.plateDetails;
        if (!pd?.formatCode || !pd.regionCode || !pd.series || !pd.number) {
          throw new Error('Cannot duplicate plate without plate details');
        }
        const created = await http.post<Parameters<typeof mapManagedItem>[0]>(basePath(domain), {
          categoryId: item.categoryId,
          cityId: item.cityId,
          title,
          description,
          language: 'ar',
          primaryPrice: item.price ?? undefined,
          currencyCode: item.currencyCode || 'IQD',
          formatCode: pd.formatCode,
          regionCode: pd.regionCode,
          series: pd.series,
          number: `${pd.number}-c`.slice(0, 20),
          plateCategoryId: pd.plateCategoryId ?? undefined,
          platePrefixId: pd.platePrefixId ?? undefined,
          plateType: pd.plateType ?? undefined,
        });
        return mapManagedItem(created, domain, locale);
      }

      const created = await http.post<Parameters<typeof mapManagedItem>[0]>(basePath(domain), {
        categoryId: item.categoryId,
        cityId: item.cityId,
        title,
        description,
        language: 'ar',
        primaryPrice: item.price ?? undefined,
        currencyCode: item.currencyCode || 'IQD',
      });
      return mapManagedItem(created, domain, locale);
    },
  };
}
