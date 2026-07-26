import type { HttpClient } from '@/lib/api/http-client';

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationsPage = {
  page: number;
  pageSize: number;
  total: number;
  items: AppNotification[];
};

export type NotificationsRepository = {
  list(page?: number, pageSize?: number, unreadOnly?: boolean): Promise<NotificationsPage>;
  markRead(id: string): Promise<AppNotification | null>;
  markAllRead(): Promise<void>;
};

function qs(params: Record<string, string | number | boolean | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === '') continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export function createNotificationsRepository(http: HttpClient): NotificationsRepository {
  return {
    list: (page = 1, pageSize = 30, unreadOnly) =>
      http.get<NotificationsPage>(
        `/v1/notifications${qs({ page, pageSize, unreadOnly })}`,
      ),
    markRead: (id) => http.patch<AppNotification | null>(`/v1/notifications/${id}`),
    markAllRead: async () => {
      await http.patch('/v1/notifications', { all: true });
    },
  };
}
