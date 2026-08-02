import { buildQuery } from '@/lib/api/http-client';
import { getHttpClient } from '@/lib/api/client';
import { createVehicleAdminApi } from '@/lib/api/vehicle-api';
import type {
  PlateCategory,
  PlatePrefix,
  PlateVerification,
  AdminAuditLog,
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
  UserRole,
  UserStatus,
  ReportStatus,
} from '@/lib/api/types';

const http = () => getHttpClient();

export const adminApi = {
  dashboard: () => http().get<DashboardSummary>('/v1/admin/dashboard'),

  stats: (range: StatsRange = 'monthly') =>
    http().get<StatsOverview>(`/v1/admin/stats${buildQuery({ range })}`),

  listings: createVehicleAdminApi(http, '/v1/admin/listings'),

  vehicles: createVehicleAdminApi(http, '/v1/admin/vehicles'),

  plates: {
    list: (
      params: PaginationQuery & {
        governorate?: string;
        code?: string;
        letter?: string;
        number?: string;
        plateType?: string;
        status?: string;
      },
    ) => http().get<Paginated<AdminPlate>>(`/v1/admin/plates${buildQuery(params)}`),
    get: (id: string) => http().get<AdminPlate>(`/v1/admin/plates/${id}`),
    create: (body: Record<string, unknown>) =>
      http().post<AdminPlate>('/v1/admin/plates', body),
    update: (id: string, body: Record<string, unknown>) =>
      http().patch<AdminPlate>(`/v1/admin/plates/${id}`, body),
    delete: (id: string) => http().delete<AdminPlate>(`/v1/admin/plates/${id}`),
    approve: (id: string) => http().post<AdminPlate>(`/v1/admin/plates/${id}/approve`),
    reject: (id: string) => http().post<AdminPlate>(`/v1/admin/plates/${id}/reject`),
    catalog: {
      categories: {
        list: () => http().get<PlateCategory[]>('/v1/admin/plates/catalog/categories'),
        create: (body: Record<string, unknown>) =>
          http().post<PlateCategory>('/v1/admin/plates/catalog/categories', body),
        update: (categoryId: string, body: Record<string, unknown>) =>
          http().patch<PlateCategory>(
            `/v1/admin/plates/catalog/categories/${categoryId}`,
            body,
          ),
        delete: (categoryId: string) =>
          http().delete<PlateCategory>(`/v1/admin/plates/catalog/categories/${categoryId}`),
      },
      prefixes: {
        list: (formatCode?: string) =>
          http().get<PlatePrefix[]>(
            `/v1/admin/plates/catalog/prefixes${buildQuery({ formatCode })}`,
          ),
        create: (body: Record<string, unknown>) =>
          http().post<PlatePrefix>('/v1/admin/plates/catalog/prefixes', body),
        update: (prefixId: string, body: Record<string, unknown>) =>
          http().patch<PlatePrefix>(`/v1/admin/plates/catalog/prefixes/${prefixId}`, body),
        delete: (prefixId: string) =>
          http().delete<PlatePrefix>(`/v1/admin/plates/catalog/prefixes/${prefixId}`),
      },
    },
    verifications: {
      list: (params: PaginationQuery & { listingId?: string }) =>
        http().get<Paginated<PlateVerification>>(
          `/v1/admin/plates/verifications${buildQuery(params)}`,
        ),
    },
  },

  dealers: {
    list: (
      params: PaginationQuery & {
        verified?: boolean;
        status?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
      },
    ) => http().get<Paginated<DealerOrganization>>(`/v1/admin/dealers${buildQuery(params)}`),
    get: (id: string) => http().get<DealerOrganization>(`/v1/admin/dealers/${id}`),
    create: (body: Record<string, unknown>) =>
      http().post<DealerOrganization>('/v1/admin/dealers', body),
    update: (id: string, body: Record<string, unknown>) =>
      http().patch<DealerOrganization>(`/v1/admin/dealers/${id}`, body),
    delete: (id: string) => http().delete<DealerOrganization>(`/v1/admin/dealers/${id}`),
    approve: (id: string) =>
      http().post<DealerOrganization>(`/v1/admin/dealers/${id}/approve`),
    reject: (id: string, reason: string) =>
      http().post<DealerOrganization>(`/v1/admin/dealers/${id}/reject`, { reason }),
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
    list: (
      params: PaginationQuery & { status?: ReportStatus; domain?: 'VEHICLE' | 'PLATE' },
    ) => http().get<Paginated<ListingReport>>(`/v1/admin/reports${buildQuery(params)}`),
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

  communication: {
    stats: () =>
      http().get<{
        conversations: number;
        messages: number;
        openReports: number;
        blocks: number;
        flaggedMessages: number;
      }>('/v1/admin/communication/stats'),
    reports: (params: PaginationQuery & { status?: ReportStatus }) =>
      http().get<
        Paginated<{
          id: string;
          reason: string;
          details: string | null;
          status: ReportStatus;
          createdAt: string;
          conversationId: string;
          reporter?: { id: string; displayName: string | null };
        }>
      >(`/v1/admin/communication/reports${buildQuery(params)}`),
    resolveReport: (id: string, body: { status: 'RESOLVED' | 'REJECTED'; resolution?: string }) =>
      http().patch(`/v1/admin/communication/reports/${id}`, body),
    blocks: (params: PaginationQuery) =>
      http().get<
        Paginated<{
          id: string;
          createdAt: string;
          reason: string | null;
          blocker?: { id: string; displayName: string | null };
          blocked?: { id: string; displayName: string | null };
        }>
      >(`/v1/admin/communication/blocks${buildQuery(params)}`),
    moderate: (body: {
      action: 'hide_conversation' | 'remove_message';
      conversationId?: string;
      messageId?: string;
    }) => http().post('/v1/admin/communication/moderate', body),
  },
};
