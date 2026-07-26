'use client';

import { useQuery } from '@tanstack/react-query';
import type { LucideIcon } from '@/components/icons';
import {
  Building2,
  Car,
  CircleDollarSign,
  Flag,
  Hash,
  ICON_SIZE_LG,
  ICON_STROKE,
  Inbox,
  MessagesSquare,
  TrendingUp,
  Users,
} from '@/components/icons';
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
  cn,
  formatDate,
  formatPrice,
} from '@/components/ui';

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'brand',
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  accent?: 'brand' | 'success' | 'warning' | 'info' | 'neutral';
}) {
  const accentClass = {
    brand: 'bg-brand-soft text-brand',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    info: 'bg-info-soft text-info',
    neutral: 'bg-surface-muted text-ink-secondary',
  }[accent];

  return (
    <div className="group rounded-xl border border-border bg-surface p-5 shadow-card transition-all duration-200 ease-soft hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-ink-secondary">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {hint ? <p className="mt-1.5 text-xs text-ink-secondary">{hint}</p> : null}
        </div>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
            accentClass,
          )}
        >
          <Icon size={ICON_SIZE_LG} strokeWidth={ICON_STROKE} aria-hidden />
        </span>
      </div>
    </div>
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
    <Card title={title} description="Last 30 days">
      {items.length === 0 ? (
        <EmptyState title="No data yet" description="Metrics will appear as activity grows." />
      ) : (
        <ul className="space-y-4">
          {items.slice(0, 6).map((item, idx) => {
            const pct = (item.count / max) * 100;
            return (
              <li key={idx}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-ink">{labelKey(item)}</span>
                  <span className="shrink-0 tabular-nums text-ink-secondary">{item.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-brand-pressed transition-all duration-500 ease-soft"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
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
  const chatStats = useQuery({
    queryKey: ['admin', 'communication', 'stats'],
    queryFn: () => adminApi.communication.stats(),
  });
  const openReports = useQuery({
    queryKey: ['admin', 'reports', 'open-count'],
    queryFn: () => adminApi.reports.list({ page: 1, pageSize: 1, status: 'OPEN' }),
  });

  if (dashboard.isLoading || stats.isLoading) {
    return (
      <div className="space-y-7">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[116px] rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
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
  const conversations = chatStats.data?.conversations ?? 0;
  const reportsTotal = openReports.data?.total ?? 0;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Platform overview, marketplace health, and recent staff activity."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total vehicles" value={d.totalCars} icon={Car} accent="brand" />
        <KpiCard label="Total plates" value={d.totalPlates} icon={Hash} accent="info" />
        <KpiCard label="Users" value={d.totalUsers} icon={Users} accent="neutral" />
        <KpiCard label="Dealers" value={d.totalDealers} icon={Building2} accent="neutral" />
        <KpiCard
          label="Pending approvals"
          value={d.pendingListings}
          hint="Awaiting moderation"
          icon={Inbox}
          accent="warning"
        />
        <KpiCard
          label="Active conversations"
          value={conversations}
          hint={chatStats.isFetched ? undefined : 'Loading…'}
          icon={MessagesSquare}
          accent="info"
        />
        <KpiCard
          label="Open reports"
          value={reportsTotal}
          hint={openReports.isFetched ? 'Listing reports' : 'Loading…'}
          icon={Flag}
          accent="warning"
        />
        <KpiCard
          label="Avg price (IQD)"
          value={
            d.currency?.averagePriceByCurrency.find((c) => c.currencyCode === 'IQD')
              ?.averagePrice != null
              ? Math.round(
                  d.currency.averagePriceByCurrency.find((c) => c.currencyCode === 'IQD')!
                    .averagePrice!,
                ).toLocaleString()
              : '—'
          }
          hint="Active listings"
          icon={CircleDollarSign}
          accent="success"
        />
      </div>

      {d.currency ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card title="Vehicles by currency" description="Active listings">
            <ul className="space-y-2 text-sm">
              {d.currency.vehiclesByCurrency.map((row) => (
                <li key={row.currencyCode} className="flex justify-between">
                  <span>{row.currencyCode}</span>
                  <span className="tabular-nums font-medium">{row.count}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Plates by currency" description="Active listings">
            <ul className="space-y-2 text-sm">
              {d.currency.platesByCurrency.map((row) => (
                <li key={row.currencyCode} className="flex justify-between">
                  <span>{row.currencyCode}</span>
                  <span className="tabular-nums font-medium">{row.count}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Average price by currency" description="Active listings">
            <ul className="space-y-2 text-sm">
              {d.currency.averagePriceByCurrency.map((row) => (
                <li key={row.currencyCode} className="flex justify-between gap-3">
                  <span>{row.currencyCode}</span>
                  <span className="tabular-nums font-medium">
                    {row.averagePrice != null
                      ? formatPrice(row.averagePrice, row.currencyCode)
                      : '—'}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active listings"
          value={d.activeListings}
          icon={TrendingUp}
          accent="success"
        />
        <KpiCard label="Today" value={d.todaysListings} hint="New listings" icon={Inbox} />
        <KpiCard label="This month" value={d.thisMonthListings} icon={TrendingUp} />
        <KpiCard
          label="Engagement"
          value={d.totalViews}
          hint={`${d.totalFavorites.toLocaleString()} favorites`}
          icon={TrendingUp}
          accent="brand"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
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
          items={s.topDealers.map((row) => ({ ...row, count: row.cars }))}
          labelKey={(i) => ('name' in i ? String(i.name) : '')}
        />
      </div>

      <div className="mt-6">
        <Card title="Recent audit activity" description="Latest staff actions across the platform" padded={false}>
          <div className="px-1">
            {audit.isLoading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
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
                      <Td className="text-ink-secondary">{formatDate(log.createdAt)}</Td>
                      <Td className="font-medium">
                        {log.actor?.displayName ?? log.actor?.phone ?? 'System'}
                      </Td>
                      <Td>
                        <Badge tone="neutral">{log.module}</Badge>
                      </Td>
                      <Td>{log.action}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
