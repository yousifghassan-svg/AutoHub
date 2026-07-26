import type { HttpClient } from '@/lib/api/http-client';
import { toQueryString } from '@/src/lib/query';

export type AppNotificationDto = {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationsRepository = {
  list(page?: number, pageSize?: number): Promise<{
    items: AppNotificationDto[];
    page: number;
    pageSize: number;
    total: number;
  }>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
  registerDevice(token: string, platform?: string): Promise<void>;
};

export function createNotificationsRepository(http: HttpClient): NotificationsRepository {
  return {
    list: (page = 1, pageSize = 30) =>
      http.get(`/v1/notifications${toQueryString({ page, pageSize })}`, true),
    markRead: async (id) => {
      await http.request(`/v1/notifications/${id}`, { method: 'PATCH' });
    },
    markAllRead: async () => {
      await http.request('/v1/notifications', {
        method: 'PATCH',
        body: { all: true },
      });
    },
    registerDevice: async (token, platform = 'EXPO') => {
      await http.post('/v1/notifications/devices', { token, platform }, true);
    },
  };
}
