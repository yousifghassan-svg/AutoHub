'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.repository';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  Table,
  Td,
  Th,
  formatDate,
} from '@/components/ui';

function KpiCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-ink-secondary">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-ink">{value.toLocaleString()}</p>
      {hint ? <p className="mt-1 text-xs text-ink-secondary">{hint}</p> : null}
    </Card>
  );
}

function BarChart({
  title,
  items,
  labelKey,
}: {
  title: string;
  items: { count: number }[];
  labelKey: (item: (typeof items)[0]) => string;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <Card title={title}>
      {items.length === 0 ? (
        <EmptyState title="No data yet" />
      ) : (
        <ul className="space-y-3">
          {items.slice(0, 6).map((item, idx) => (
            <li key={idx}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-ink">{labelKey(item)}</span>
                <span className="font-medium text-ink-secondary">{item.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const dashboard = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: adminApi.dashboard });
  const stats = useQuery({
    queryKey: ['admin', 'stats', 'monthly'],
    queryFn: () => adminApi.stats('monthly'),
  });
  const audit = useQuery({
    queryKey: ['admin', 'audit-logs', 'recent'],
    queryFn: () => adminApi.auditLogs.list({ page: 1, pageSize: 8 }),
  });

  if (dashboard.isLoading || stats.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (dashboard.isError || stats.isError) {
    return (
      <ErrorState
        message="Failed to load dashboard"
        onRetry={() => {
          void dashboard.refetch();
          void stats.refetch();
        }}
      />
    );
  }

  const d = dashboard.data!;
  const s = stats.data!;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Platform overview and recent activity."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total users" value={d.totalUsers} />
        <KpiCard label="Total dealers" value={d.totalDealers} />
        <KpiCard label="Active listings" value={d.activeListings} />
        <KpiCard label="Pending listings" value={d.pendingListings} />
        <KpiCard label="Today's listings" value={d.todaysListings} />
        <KpiCard label="This month" value={d.thisMonthListings} />
        <KpiCard label="Total views" value={d.totalViews} />
        <KpiCard label="Total favorites" value={d.totalFavorites} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <BarChart
          title="Top brands"
          items={s.topBrands}
          labelKey={(i) => ('nameEn' in i ? String(i.nameEn) : '')}
        />
        <BarChart
          title="Top cities"
          items={s.topCities}
          labelKey={(i) => ('nameEn' in i ? String(i.nameEn) : '')}
        />
        <BarChart
          title="Top dealers"
          items={s.topDealers.map((d) => ({ ...d, count: d.cars }))}
          labelKey={(i) => ('name' in i ? String(i.name) : '')}
        />
      </div>

      <div className="mt-6">
        <Card title="Recent audit activity">
          {audit.isLoading ? (
            <Skeleton className="h-40" />
          ) : audit.isError ? (
            <ErrorState message="Failed to load audit logs" onRetry={() => void audit.refetch()} />
          ) : audit.data!.items.length === 0 ? (
            <EmptyState title="No audit entries yet" />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>When</Th>
                  <Th>Actor</Th>
                  <Th>Module</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {audit.data!.items.map((log) => (
                  <tr key={log.id}>
                    <Td>{formatDate(log.createdAt)}</Td>
                    <Td>{log.actor?.displayName ?? log.actor?.phone ?? 'System'}</Td>
                    <Td>
                      <Badge tone="neutral">{log.module}</Badge>
                    </Td>
                    <Td>{log.action}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
