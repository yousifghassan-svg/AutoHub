'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '@/lib/api/admin.repository';
import type { StatsRange } from '@/lib/api/types';
import {
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Select,
  Skeleton,
} from '@/components/ui';

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
        <EmptyState title="No data" />
      ) : (
        <ul className="space-y-3">
          {items.slice(0, 10).map((item, idx) => (
            <li key={idx}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{labelKey(item)}</span>
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

export default function StatisticsPage() {
  const [range, setRange] = useState<StatsRange>('monthly');

  const query = useQuery({
    queryKey: ['admin', 'stats', range],
    queryFn: () => adminApi.stats(range),
  });

  if (query.isLoading) return <Skeleton className="h-96" />;
  if (query.isError) {
    return <ErrorState message="Failed to load statistics" onRetry={() => void query.refetch()} />;
  }

  const s = query.data!;

  return (
    <div>
      <PageHeader
        title="Statistics"
        description={`Metrics since ${new Date(s.since).toLocaleDateString()}.`}
        action={
          <Select
            value={range}
            onChange={(e) => setRange(e.target.value as StatsRange)}
            className="w-40"
            aria-label="Time range"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-ink-secondary">Listings created</p>
          <p className="mt-2 font-display text-3xl font-bold">{s.listingsCreated}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink-secondary">Users created</p>
          <p className="mt-2 font-display text-3xl font-bold">{s.usersCreated}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink-secondary">Search events</p>
          <p className="mt-2 font-display text-3xl font-bold">{s.searchEvents}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink-secondary">Sold</p>
          <p className="mt-2 font-display text-3xl font-bold">{s.sold}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart title="Top brands" items={s.topBrands} labelKey={(i) => ('nameEn' in i ? String(i.nameEn) : '')} />
        <BarChart title="Top cities" items={s.topCities} labelKey={(i) => ('nameEn' in i ? String(i.nameEn) : '')} />
        <BarChart title="Top searches" items={s.topSearched} labelKey={(i) => ('keyword' in i ? String(i.keyword) : '')} />
        <BarChart
          title="Top dealers"
          items={s.topDealers.map((d) => ({ ...d, count: d.cars }))}
          labelKey={(i) => ('name' in i ? String(i.name) : '')}
        />
      </div>
    </div>
  );
}
