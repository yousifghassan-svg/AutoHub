import { buildQuery } from '@/lib/api/http-client';
import type { AdminListing, ListingStatus, Paginated, PaginationQuery } from '@/lib/api/types';
import type { getHttpClient } from '@/lib/api/client';

export type VehicleListParams = PaginationQuery & {
  status?: ListingStatus;
  categoryCode?: string;
  brandId?: string;
  cityId?: string;
  sellerId?: string;
  dealerId?: string;
  year?: number;
  featured?: boolean;
  includeDeleted?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  currencyCode?: string;
};

export type VehicleBulkAction =
  | 'delete'
  | 'archive'
  | 'activate'
  | 'deactivate'
  | 'feature'
  | 'unfeature'
  | 'restore';

export function createVehicleAdminApi(
  http: () => ReturnType<typeof getHttpClient>,
  basePath: string,
) {
  return {
    list: (params: VehicleListParams) =>
      http().get<Paginated<AdminListing>>(`${basePath}${buildQuery(params)}`),
    get: (id: string, includeDeleted = false) =>
      http().get<AdminListing>(
        `${basePath}/${id}${buildQuery({ includeDeleted: includeDeleted || undefined })}`,
      ),
    create: (body: Record<string, unknown>) => http().post<AdminListing>(basePath, body),
    update: (id: string, body: Record<string, unknown>) =>
      http().patch<AdminListing>(`${basePath}/${id}`, body),
    delete: (id: string) => http().delete<AdminListing>(`${basePath}/${id}`),
    restore: (id: string) => http().post<AdminListing>(`${basePath}/${id}/restore`),
    permanentDelete: (id: string, force = false) =>
      http().delete<AdminListing>(
        `${basePath}/${id}/permanent${buildQuery({ force: force || undefined })}`,
      ),
    bulk: (body: { ids: string[]; action: VehicleBulkAction }) =>
      http().post<{ success: boolean; count: number }>(`${basePath}/bulk`, body),
    exportCsv: async (params: Record<string, string | number | boolean | undefined>) => {
      const session = await import('@/lib/api/client').then((m) => m.getTokenStorage().load());
      const res = await fetch(
        `${(await import('@/lib/config')).config.apiUrl}${basePath}/export${buildQuery(params)}`,
        {
          headers: {
            Accept: 'text/csv',
            ...(session?.accessToken
              ? { Authorization: `Bearer ${session.accessToken}` }
              : {}),
          },
        },
      );
      if (!res.ok) throw new Error('Export failed');
      return res.text();
    },
    approve: (id: string) => http().post<AdminListing>(`${basePath}/${id}/approve`),
    reject: (id: string) => http().post<AdminListing>(`${basePath}/${id}/reject`),
    publish: (id: string) => http().post<AdminListing>(`${basePath}/${id}/publish`),
    unpublish: (id: string) => http().post<AdminListing>(`${basePath}/${id}/unpublish`),
    duplicate: (id: string) => http().post<AdminListing>(`${basePath}/${id}/duplicate`),
    archive: (id: string) => http().post<AdminListing>(`${basePath}/${id}/archive`),
    feature: (id: string) => http().post<AdminListing>(`${basePath}/${id}/feature`),
    unfeature: (id: string) => http().post<AdminListing>(`${basePath}/${id}/unfeature`),
    addMedia: (id: string, body: Record<string, unknown>) =>
      http().post(`/v1/listings/${id}/media`, body),
    reorderMedia: (id: string, orderedIds: string[]) =>
      http().patch(`/v1/listings/${id}/media/reorder`, { orderedIds }),
    setPrimaryMedia: (id: string, mediaId: string) =>
      http().post(`/v1/listings/${id}/media/${mediaId}/primary`),
    deleteMedia: (id: string, mediaId: string) =>
      http().delete(`/v1/listings/${id}/media/${mediaId}`),
  };
}
