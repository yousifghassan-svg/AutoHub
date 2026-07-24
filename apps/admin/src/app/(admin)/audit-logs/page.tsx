'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminApi } from '@/lib/api/admin.repository';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Pagination,
  Select,
  Skeleton,
  Table,
  Td,
  Th,
  formatDate,
} from '@/components/ui';

const MODULES = [
  'listings',
  'plates',
  'dealers',
  'users',
  'reports',
  'settings',
] as const;

export default function AuditLogsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get('page') ?? '1');
  const q = searchParams.get('q') ?? '';
  const moduleFilter = searchParams.get('module') ?? '';
  const action = searchParams.get('action') ?? '';
  const actorId = searchParams.get('actorId') ?? '';
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';

  const query = useQuery({
    queryKey: ['admin', 'audit-logs', { page, q, module: moduleFilter, action, actorId, from, to }],
    queryFn: () =>
      adminApi.auditLogs.list({
        page,
        pageSize: 25,
        q: q || undefined,
        module: moduleFilter || undefined,
        action: action || undefined,
        actorId: actorId || undefined,
        from: from || undefined,
        to: to || undefined,
      }),
  });

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    router.replace(`/audit-logs?${params.toString()}`);
  };

  return (
    <div>
      <PageHeader title="Audit logs" description="Staff action history across the platform." />

      <Card className="mb-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Module"
            value={moduleFilter}
            onChange={(e) => setParam('module', e.target.value)}
          >
            <option value="">All modules</option>
            {MODULES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <Input
            label="Action contains"
            value={action}
            onChange={(e) => setParam('action', e.target.value)}
          />
          <Input
            label="Actor ID"
            value={actorId}
            onChange={(e) => setParam('actorId', e.target.value)}
          />
          <Input
            label="From (ISO date)"
            type="datetime-local"
            value={from}
            onChange={(e) => setParam('from', e.target.value ? new Date(e.target.value).toISOString() : '')}
          />
          <Input
            label="To (ISO date)"
            type="datetime-local"
            value={to}
            onChange={(e) => setParam('to', e.target.value ? new Date(e.target.value).toISOString() : '')}
          />
        </div>
      </Card>

      {query.isLoading ? (
        <Skeleton className="h-96" />
      ) : query.isError ? (
        <ErrorState message="Failed to load audit logs" onRetry={() => void query.refetch()} />
      ) : query.data!.items.length === 0 ? (
        <EmptyState title="No audit entries found" />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>When</Th>
                <Th>Actor</Th>
                <Th>Module</Th>
                <Th>Action</Th>
                <Th>Entity</Th>
                <Th>IP</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.data!.items.map((log) => (
                <tr key={log.id}>
                  <Td>{formatDate(log.createdAt)}</Td>
                  <Td>
                    <div>
                      <p>{log.actor?.displayName ?? log.actor?.phone ?? 'System'}</p>
                      {log.actor?.role ? (
                        <p className="text-xs text-ink-secondary">{log.actor.role}</p>
                      ) : null}
                    </div>
                  </Td>
                  <Td>
                    <Badge tone="neutral">{log.module}</Badge>
                  </Td>
                  <Td>{log.action}</Td>
                  <Td className="max-w-[120px] truncate font-mono text-xs">{log.entityId ?? '—'}</Td>
                  <Td className="text-xs text-ink-secondary">{log.ip ?? '—'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="px-4 pb-4">
            <Pagination
              page={query.data!.page}
              totalPages={query.data!.totalPages}
              onPageChange={(p) => setParam('page', String(p))}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
