import { buildQuery } from '@/lib/api/http-client';
import { getHttpClient } from '@/lib/api/client';
import type {
  AdminAuditLog,
  AdminListing,
  AdminMediaAsset,
  AdminPlate,
  AdminUser,
  DashboardSummary,
  DealerOrganization,
  ListingReport,
  Paginated,
  PaginationQuery,
  SiteSettings,
  StatsOverview,
  StatsRange,
  ListingStatus,
  UserRole,
  UserStatus,
  ReportStatus,
} from '@/lib/api/types';

const http = () => getHttpClient();

export const adminApi = {
  dashboard: () => http().get<DashboardSummary>('/v1/admin/dashboard'),

  stats: (range: StatsRange = 'monthly') =>
    http().get<StatsOverview>(`/v1/admin/stats${buildQuery({ range })}`),

  listings: {
    list: (
      params: PaginationQuery & {
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
      },
    ) => http().get<Paginated<AdminListing>>(`/v1/admin/listings${buildQuery(params)}`),
    get: (id: string, includeDeleted = false) =>
      http().get<AdminListing>(
        `/v1/admin/listings/${id}${buildQuery({ includeDeleted: includeDeleted || undefined })}`,
      ),
    create: (body: Record<string, unknown>) =>
      http().post<AdminListing>('/v1/admin/listings', body),
    update: (id: string, body: Record<string, unknown>) =>
      http().patch<AdminListing>(`/v1/admin/listings/${id}`, body),
    delete: (id: string) => http().delete<AdminListing>(`/v1/admin/listings/${id}`),
    restore: (id: string) => http().post<AdminListing>(`/v1/admin/listings/${id}/restore`),
    permanentDelete: (id: string, force = false) =>
      http().delete<AdminListing>(
        `/v1/admin/listings/${id}/permanent${buildQuery({ force: force || undefined })}`,
      ),
    bulk: (body: {
      ids: string[];
      action:
        | 'delete'
        | 'archive'
        | 'activate'
        | 'deactivate'
        | 'feature'
        | 'unfeature'
        | 'restore';
    }) => http().post<{ success: boolean; count: number }>('/v1/admin/listings/bulk', body),
    exportCsv: async (params: Record<string, string | number | boolean | undefined>) => {
      const session = await import('@/lib/api/client').then((m) => m.getTokenStorage().load());
      const res = await fetch(
        `${(await import('@/lib/config')).config.apiUrl}/v1/admin/listings/export${buildQuery(params)}`,
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
    approve: (id: string) => http().post<AdminListing>(`/v1/admin/listings/${id}/approve`),
    reject: (id: string) => http().post<AdminListing>(`/v1/admin/listings/${id}/reject`),
    publish: (id: string) => http().post<AdminListing>(`/v1/admin/listings/${id}/publish`),
    unpublish: (id: string) => http().post<AdminListing>(`/v1/admin/listings/${id}/unpublish`),
    duplicate: (id: string) => http().post<AdminListing>(`/v1/admin/listings/${id}/duplicate`),
    archive: (id: string) => http().post<AdminListing>(`/v1/admin/listings/${id}/archive`),
    feature: (id: string) => http().post<AdminListing>(`/v1/admin/listings/${id}/feature`),
    unfeature: (id: string) => http().post<AdminListing>(`/v1/admin/listings/${id}/unfeature`),
    addMedia: (id: string, body: Record<string, unknown>) =>
      http().post(`/v1/listings/${id}/media`, body),
    reorderMedia: (id: string, orderedIds: string[]) =>
      http().patch(`/v1/listings/${id}/media/reorder`, { orderedIds }),
    setPrimaryMedia: (id: string, mediaId: string) =>
      http().post(`/v1/listings/${id}/media/${mediaId}/primary`),
    deleteMedia: (id: string, mediaId: string) =>
      http().delete(`/v1/listings/${id}/media/${mediaId}`),
  },

  plates: {
    list: (
      params: PaginationQuery & {
        governorate?: string;
        code?: string;
        letter?: string;
        number?: string;
        plateType?: string;
      },
    ) => http().get<Paginated<AdminPlate>>(`/v1/admin/plates${buildQuery(params)}`),
    get: (id: string) => http().get<AdminPlate>(`/v1/admin/plates/${id}`),
    create: (body: Record<string, unknown>) =>
      http().post<AdminPlate>('/v1/admin/plates', body),
    update: (id: string, body: Record<string, unknown>) =>
      http().patch<AdminPlate>(`/v1/admin/plates/${id}`, body),
    delete: (id: string) => http().delete<AdminPlate>(`/v1/admin/plates/${id}`),
  },

  dealers: {
    list: (params: PaginationQuery & { verified?: boolean }) =>
      http().get<Paginated<DealerOrganization>>(`/v1/admin/dealers${buildQuery(params)}`),
    get: (id: string) => http().get<DealerOrganization>(`/v1/admin/dealers/${id}`),
    create: (body: Record<string, unknown>) =>
      http().post<DealerOrganization>('/v1/admin/dealers', body),
    update: (id: string, body: Record<string, unknown>) =>
      http().patch<DealerOrganization>(`/v1/admin/dealers/${id}`, body),
    delete: (id: string) => http().delete<DealerOrganization>(`/v1/admin/dealers/${id}`),
  },

  users: {
    list: (params: PaginationQuery & { role?: UserRole; status?: UserStatus }) =>
      http().get<Paginated<AdminUser>>(`/v1/admin/users${buildQuery(params)}`),
    get: (id: string) => http().get<AdminUser>(`/v1/admin/users/${id}`),
    update: (id: string, body: Record<string, unknown>) =>
      http().patch<AdminUser>(`/v1/admin/users/${id}`, body),
    delete: (id: string) => http().delete<AdminUser>(`/v1/admin/users/${id}`),
    suspend: (id: string) => http().post<AdminUser>(`/v1/admin/users/${id}/suspend`),
    activate: (id: string) => http().post<AdminUser>(`/v1/admin/users/${id}/activate`),
    verifyDealer: (id: string) =>
      http().post<AdminUser>(`/v1/admin/users/${id}/verify-dealer`),
  },

  reports: {
    list: (params: PaginationQuery & { status?: ReportStatus }) =>
      http().get<Paginated<ListingReport>>(`/v1/admin/reports${buildQuery(params)}`),
    resolve: (id: string, resolution?: string) =>
      http().post<ListingReport>(`/v1/admin/reports/${id}/resolve`, { resolution }),
    reject: (id: string, resolution?: string) =>
      http().post<ListingReport>(`/v1/admin/reports/${id}/reject`, { resolution }),
    banListing: (id: string, resolution?: string) =>
      http().post<ListingReport>(`/v1/admin/reports/${id}/ban-listing`, { resolution }),
  },

  settings: {
    get: () => http().get<SiteSettings>('/v1/admin/settings'),
    update: (body: Record<string, unknown>) =>
      http().patch<SiteSettings>('/v1/admin/settings', body),
  },

  auditLogs: {
    list: (
      params: PaginationQuery & {
        actorId?: string;
        action?: string;
        module?: string;
        entityId?: string;
        from?: string;
        to?: string;
      },
    ) => http().get<Paginated<AdminAuditLog>>(`/v1/admin/audit-logs${buildQuery(params)}`),
  },

  media: {
    list: (
      params: PaginationQuery & {
        mediaType?: string;
        status?: string;
        unused?: boolean;
        duplicates?: boolean;
        includeDeleted?: boolean;
      },
    ) =>
      http().get<
        Paginated<AdminMediaAsset> & {
          storageUsage: { totalBytes: number; assetCount: number };
          duplicateChecksums?: string[];
        }
      >(`/v1/admin/media${buildQuery(params)}`),
    delete: (id: string) => http().delete<{ success: boolean }>(`/v1/admin/media/${id}`),
    restore: (id: string) => http().post<AdminMediaAsset>(`/v1/admin/media/${id}/restore`),
  },
};
