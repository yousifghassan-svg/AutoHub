'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { adminApi } from '@/lib/api/admin.repository';
import type { ReportStatus } from '@/lib/api/types';
import {
  Badge,
  Button,
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
  statusBadgeTone,
  useConfirm,
  useToast,
} from '@/components/ui';

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { toast } = useToast();

  const page = Number(searchParams.get('page') ?? '1');
  const status = (searchParams.get('status') as ReportStatus | null) ?? undefined;
  const [resolution, setResolution] = useState('');

  const query = useQuery({
    queryKey: ['admin', 'reports', { page, status }],
    queryFn: () => adminApi.reports.list({ page, pageSize: 20, status }),
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });

  const act = async (
    id: string,
    type: 'resolve' | 'reject' | 'ban-listing',
    label: string,
  ) => {
    const ok = await confirm({
      title: `${label} report?`,
      variant: type === 'ban-listing' ? 'danger' : 'primary',
      confirmLabel: label,
    });
    if (!ok) return;
    try {
      if (type === 'resolve') await adminApi.reports.resolve(id, resolution || undefined);
      else if (type === 'reject') await adminApi.reports.reject(id, resolution || undefined);
      else await adminApi.reports.banListing(id, resolution || undefined);
      toast(`${label} successful`, 'success');
      invalidate();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Action failed', 'error');
    }
  };

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    router.replace(`/reports?${params.toString()}`);
  };

  return (
    <div>
      <PageHeader title="Reports" description="Review and resolve listing reports." />

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <Select
            label="Status"
            value={status ?? ''}
            onChange={(e) => setParam('status', e.target.value)}
            className="w-44"
          >
            <option value="">All</option>
            {(['OPEN', 'RESOLVED', 'REJECTED'] as ReportStatus[]).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Input
            label="Resolution note (optional)"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="max-w-md"
          />
        </div>
      </Card>

      {query.isLoading ? (
        <Skeleton className="h-96" />
      ) : query.isError ? (
        <ErrorState message="Failed to load reports" onRetry={() => void query.refetch()} />
      ) : query.data!.items.length === 0 ? (
        <EmptyState title="No reports found" />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Listing</Th>
                <Th>Reason</Th>
                <Th>Reporter</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.data!.items.map((report) => (
                <tr key={report.id}>
                  <Td>
                    {report.listing ? (
                      <Link
                        href={
                          report.listing.domain === 'PLATE' ||
                          report.listing.categoryCode === 'PLATE'
                            ? `/plates?highlight=${report.listing.id}`
                            : `/vehicles/${report.listing.id}`
                        }
                        className="text-brand hover:underline"
                      >
                        {report.listing.title}
                      </Link>
                    ) : (
                      report.listingId
                    )}
                  </Td>
                  <Td>{report.reason}</Td>
                  <Td>{report.reporter?.displayName ?? report.reporter?.phone ?? '—'}</Td>
                  <Td>
                    <Badge tone={statusBadgeTone(report.status)}>{report.status}</Badge>
                  </Td>
                  <Td>{formatDate(report.createdAt)}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        size="sm"
                        onClick={() => void act(report.id, 'resolve', 'Resolve')}
                      >
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => void act(report.id, 'reject', 'Reject')}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => void act(report.id, 'ban-listing', 'Ban listing')}
                      >
                        Ban listing
                      </Button>
                    </div>
                  </Td>
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
